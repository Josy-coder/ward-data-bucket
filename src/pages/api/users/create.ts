import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { withTenant } from '@/lib/tenant'
import { getToken } from 'next-auth/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const token = await getToken({ req })

        // Only ADMIN and ROOT can create users
        if (token?.role !== 'ADMIN' && token?.role !== 'ROOT') {
            return res.status(403).json({ error: 'Not authorized' })
        }

        const { email, password, name, role = 'USER' } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        // For ADMIN, can only create users in their tenant
        if (token.role === 'ADMIN') {
            const tenant = await withTenant(req)

            // Hash password and create user
            const hashedPassword = await hash(password, 10)
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: 'USER', // Admins can only create regular users
                    tenant: { connect: { id: tenant.id } }
                }
            })

            return res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            })
        }

        // For ROOT users, can create users in any tenant
        if (token.role === 'ROOT') {
            const { tenantId } = req.body

            // Hash password and create user
            const hashedPassword = await hash(password, 10)
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role,
                    ...(tenantId && {
                        tenant: { connect: { id: tenantId } }
                    })
                }
            })

            return res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            })
        }
    } catch (error) {
        console.error('Create user error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
