import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { withSecurity } from '@/middleware/security'

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { token } = req.body

        if (!token) {
            return res.status(400).json({ error: 'Token is required' })
        }

        // Find user with this verification token
        const user = await prisma.user.findFirst({
            where: { verificationToken: token }
        })

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token' })
        }

        // Update user to verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null
            }
        })

        return res.status(200).json({ message: 'Email verified successfully' })
    } catch (error) {
        console.error('Email verification error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default withSecurity(handler)