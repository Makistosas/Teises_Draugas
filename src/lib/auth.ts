import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    // Smart-ID Provider (Lithuania digital ID)
    CredentialsProvider({
      id: 'smart-id',
      name: 'Smart-ID',
      credentials: {
        personalCode: { label: 'Personal Code', type: 'text' },
        country: { label: 'Country', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.personalCode || !credentials?.country) {
          throw new Error('Personal code and country required');
        }

        // In production, this would integrate with Smart-ID API
        // For now, we simulate the flow
        const verificationResult = await verifySmartId(
          credentials.personalCode,
          credentials.country
        );

        if (!verificationResult.success) {
          throw new Error('Smart-ID verification failed');
        }

        // Find or create user based on personal code
        let user = await prisma.user.findUnique({
          where: { personalCode: credentials.personalCode },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: `${credentials.personalCode}@smart-id.lt`,
              personalCode: credentials.personalCode,
              name: verificationResult.name,
              emailVerified: new Date(),
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    // Mobile-ID Provider
    CredentialsProvider({
      id: 'mobile-id',
      name: 'Mobile-ID',
      credentials: {
        phoneNumber: { label: 'Phone Number', type: 'tel' },
        personalCode: { label: 'Personal Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.personalCode) {
          throw new Error('Phone number and personal code required');
        }

        // In production, this would integrate with Mobile-ID API
        const verificationResult = await verifyMobileId(
          credentials.phoneNumber,
          credentials.personalCode
        );

        if (!verificationResult.success) {
          throw new Error('Mobile-ID verification failed');
        }

        let user = await prisma.user.findUnique({
          where: { personalCode: credentials.personalCode },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: `${credentials.personalCode}@mobile-id.lt`,
              personalCode: credentials.personalCode,
              phone: credentials.phoneNumber,
              name: verificationResult.name,
              emailVerified: new Date(),
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

// Smart-ID verification stub (would integrate with actual API)
async function verifySmartId(
  personalCode: string,
  country: string
): Promise<{ success: boolean; name?: string }> {
  // In production, this would call the Smart-ID API
  // https://github.com/SK-EID/smart-id-documentation

  if (process.env.NODE_ENV === 'development') {
    // For development, simulate successful verification
    return {
      success: true,
      name: 'Test User',
    };
  }

  // Production implementation would go here
  const smartIdHost = process.env.SMART_ID_HOST;
  const relyingPartyUuid = process.env.SMART_ID_RELYING_PARTY_UUID;
  const relyingPartyName = process.env.SMART_ID_RELYING_PARTY_NAME;

  if (!smartIdHost || !relyingPartyUuid || !relyingPartyName) {
    throw new Error('Smart-ID configuration missing');
  }

  // TODO: Implement actual Smart-ID API integration
  // 1. Start authentication session
  // 2. Wait for user to confirm on their device
  // 3. Verify the response signature

  return { success: false };
}

// Mobile-ID verification stub
async function verifyMobileId(
  phoneNumber: string,
  personalCode: string
): Promise<{ success: boolean; name?: string }> {
  // In production, this would call the Mobile-ID API

  if (process.env.NODE_ENV === 'development') {
    return {
      success: true,
      name: 'Test User',
    };
  }

  // Production implementation would go here
  const mobileIdHost = process.env.MOBILE_ID_HOST;
  const relyingPartyUuid = process.env.MOBILE_ID_RELYING_PARTY_UUID;
  const relyingPartyName = process.env.MOBILE_ID_RELYING_PARTY_NAME;

  if (!mobileIdHost || !relyingPartyUuid || !relyingPartyName) {
    throw new Error('Mobile-ID configuration missing');
  }

  // TODO: Implement actual Mobile-ID API integration

  return { success: false };
}

// Extend next-auth types
declare module 'next-auth' {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
  }
}
