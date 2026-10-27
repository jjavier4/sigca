import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import { basePath } from '@/utils/basePath.mjs';
import { consumir, excedido, reiniciar, ipDe, QUINCE_MINUTOS } from './rate-limit';

const INTENTOS_POR_EMAIL = 5;
const INTENTOS_POR_IP = 20;
const HASH_FALSO = bcrypt.hashSync('contraseña-que-nadie-usa', 10);

export const authOptions = {
  // next-auth arma estas URLs desde el origen de NEXTAUTH_URL, por eso llevan el basePath
  pages: {
    signIn: `${basePath}/login`,
    error: `${basePath}/login`,
  },

  // Configuración de sesión
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60 // 8 horas
  },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciales inválidas');
        }

        const email = credentials.email.trim().toLowerCase();
        const claveEmail = `login:email:${email}`;
        const claveIp = `login:ip:${ipDe(req?.headers)}`;

        // Demasiados fallos recientes para este correo o esta IP
        if (excedido(claveEmail, INTENTOS_POR_EMAIL) || excedido(claveIp, INTENTOS_POR_IP)) {
          throw new Error('RATE_LIMIT');
        }

        // Buscar usuario en la base de datos
        const usuario = await prisma.usuarios.findUnique({
          where: { email },
        });

        // Se compara siempre contra un hash (el real o uno falso) para que el tiempo
        // de respuesta no revele si el correo existe
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          usuario?.password || HASH_FALSO
        );

        // Mismo mensaje si el usuario no existe o la contraseña es incorrecta
        if (!usuario || !usuario.password || !passwordMatch) {
          consumir(claveEmail, INTENTOS_POR_EMAIL, QUINCE_MINUTOS);
          consumir(claveIp, INTENTOS_POR_IP, QUINCE_MINUTOS);
          throw new Error('Credenciales inválidas');
        }

        reiniciar(claveEmail);

        // Solo quien conoce la contraseña llega a saber el estado de la cuenta
        // VALIDAR QUE LA CUENTA ESTÉ ACTIVA
        if (!usuario.activa) {
          throw new Error('CUENTA_NO_VERIFICADA'); 
        }
        // VALIDAR QUE LA CUENTA NO ESTÉ BLOQUEADA
        if (usuario.bloqueada) {
          throw new Error('CUENTA_BLOQUEADA'); 
        }

        // Retornar datos del usuario (sin la contraseña)
        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          rol: usuario.rol,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.rol = token.rol;
        session.user.email = token.email;
      }
      return session;
    },
  },

  
  secret: process.env.NEXTAUTH_SECRET,

  // Debug en desarrollo
  debug: process.env.NODE_ENV === 'development',
};
