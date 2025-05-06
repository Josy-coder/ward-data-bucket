import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import prisma from '@/lib/prisma';
import { Session } from 'next-auth';
import { User } from 'next-auth';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: { email: credentials?.email },
                });

                if (!user || !credentials?.password || !(await compare(credentials.password, user.password))) {
                    throw new Error('Invalid credentials');
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId || undefined,
                };
            },
        }),
    ],
    callbacks: {
        async session({ session, user }: { session: Session; user: User }) {
            if (user) {
                session.user.id = user.id;
                session.user.role = user.role;
                session.user.tenantId = user.tenantId;
            }
            return session;
        }
    },
};

export default NextAuth(authOptions);
