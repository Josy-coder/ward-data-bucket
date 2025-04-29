import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Get all provinces from PNG (assuming PNG has id 'png' or we can find it by name)
        const pngRegion = await prisma.geoRegion.findFirst({
            where: { name: 'PNG' }
        })

        if (!pngRegion) {
            return res.status(404).json({ error: 'PNG region not found' })
        }

        const provinces = await prisma.province.findMany({
            where: { geoRegionId: pngRegion.id },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                code: true,
                geoRegionId: true
            }
        })

        return res.status(200).json({ provinces })
    } catch (error) {
        console.error('Error fetching provinces:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}