import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

export const authOptions = {
  pages: {
    signIn: '/auth',
    error: '/auth',
  },

  // Configuración de sesión
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
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
        token.id = user.id
        token.rol = user.rol
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.rol = token.rol
      }
      return session;
    },
  },

  // Debug en desarrollo
  debug: process.env.NODE_ENV === 'development',
};
