import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { withTenant } from '@/lib/tenant'
import { getToken } from 'next-auth/jwt'

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

            // Admins can only toggle status for users in their tenant
            if (userToUpdate.tenantId !== tenant.id) {
                return res.status(403).json({ error: 'Not authorized' })
            }

            // Admins cannot disable themselves
            if (userToUpdate.id === token.sub) {
                return res.status(403).json({ error: 'Cannot disable your own account' })
            }
        } else if (token.role !== 'ROOT') {
            return res.status(403).json({ error: 'Not authorized' })
        }

        // Toggle status
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive: !userToUpdate.isActive }
        })

        return res.status(200).json({
            message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`
        })
    } catch (error) {
        console.error('Toggle user status error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}