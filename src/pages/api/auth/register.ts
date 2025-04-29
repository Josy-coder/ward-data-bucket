import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcrypt'
import prisma from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { email, password, provinceId, districtId } = req.body

        // Validate required fields
        if (!email || !password || !provinceId || !districtId) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        // Check if district already has a tenant
        const existingTenant = await prisma.tenant.findFirst({
            where: { districtId }
        })

        if (existingTenant) {
            return res.status(400).json({ error: 'District already registered' })
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' })
        }

        // Create tenant and admin user in a transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Create tenant
            const tenant = await prisma.tenant.create({
                data: {
                    district: { connect: { id: districtId } }
                }
            })

            // Hash password
            const hashedPassword = await hash(password, 10)

            // Create admin user
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'ADMIN',
                    tenant: { connect: { id: tenant.id } }
                }
            })

            return { tenant, user }
        })

        // Send verification email
        await sendVerificationEmail(email)

        return res.status(201).json({
            message: 'Registration successful. Please verify your email.'
        })
    } catch (error) {
        console.error('Registration error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}