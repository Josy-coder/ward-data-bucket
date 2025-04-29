import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { generateResetToken } from '@/lib/tokens'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ error: 'Email is required' })
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            // Return success even if user not found for security
            return res.status(200).json({
                message: 'If an account exists, you will receive a password reset email'
            })
        }

        // Generate reset token
        const resetToken = generateResetToken()
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // Save reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        })

        // Send reset email
        await sendPasswordResetEmail(email, resetToken)

        return res.status(200).json({
            message: 'If an account exists, you will receive a password reset email'
        })
    } catch (error) {
        console.error('Password reset request error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
