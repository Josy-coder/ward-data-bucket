import { NextApiHandler } from 'next'
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcrypt'

const authHandler: NextApiHandler = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password')
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    },
                    include: {
                        tenant: true
                    }
                })

                if (!user) {
                    throw new Error('No user found with this email')
                }

                const isValid = await compare(credentials.password, user.password)

                if (!isValid) {
                    throw new Error('Invalid password')
                }

                if (!user.isActive) {
                    throw new Error('This account has been deactivated')
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    tenantId: user.tenantId
                }
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.tenantId = user.tenantId
            }
            return token
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role
                session.user.tenantId = token.tenantId
            }
            return session
        }
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
    }
})

export default authHandler