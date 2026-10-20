import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

export const authOptions = {
  // next-auth arma estas URLs desde el origen de NEXTAUTH_URL, por eso llevan el basePath
  pages: {
    signIn: '/ciidici/login',
    error: '/ciidici/login',
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
      
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciales inválidas');
        }

        // Buscar usuario en la base de datos
        const usuario = await prisma.usuarios.findUnique({
          where: { email: credentials.email },
        });

        if (!usuario || !usuario.password) {
          throw new Error('Usuario no encontrado');
        }

        // VALIDAR QUE LA CUENTA ESTÉ ACTIVA
        if (!usuario.activa) {
          throw new Error('CUENTA_NO_VERIFICADA'); 
        }
        // VALIDAR QUE LA CUENTA NO ESTÉ BLOQUEADA
        if (usuario.bloqueada) {
          throw new Error('CUENTA_BLOQUEADA'); 
        }

        // Verificar la contraseña hasheada
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          usuario.password
        );

        if (!passwordMatch) {
          throw new Error('Contraseña incorrecta');
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
