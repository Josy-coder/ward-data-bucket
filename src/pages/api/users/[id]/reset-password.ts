import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { withTenant } from '@/lib/tenant'
import { getToken } from 'next-auth/jwt'
import { sendPasswordResetNotification } from '@/lib/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const token = await getToken({ req })
        const userId = req.query.id as string

        if (!token || !userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Get user to be updated
        const userToUpdate = await prisma.user.findUnique({
            where: { id: userId },
            include: { tenant: true }
        })

        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Check permissions
        if (token.role === 'ADMIN') {
            const tenant = await withTenant(req)

            // Admins can only reset passwords for users in their tenant
            if (userToUpdate.tenantId !== tenant.id) {
                return res.status(403).json({ error: 'Not authorized' })
            }
        } else if (token.role !== 'ROOT') {
            return res.status(403).json({ error: 'Not authorized' })
        }

        // Generate and hash new password
        const newPassword = Math.random().toString(36).slice(-8)
        const hashedPassword = await hash(newPassword, 10)

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        // Send notification email with new password
        await sendPasswordResetNotification(userToUpdate.email, newPassword)

        return res.status(200).json({ message: 'Password reset successful' })
    } catch (error) {
        console.error('Password reset error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}