import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcrypt'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { token, password } = req.body

        if (!token || !password) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        // Find user with valid reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        })

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' })
        }

        // Hash new password
        const hashedPassword = await hash(password, 10)

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        })

        return res.status(200).json({ message: 'Password reset successful' })
    } catch (error) {
        console.error('Password reset error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}