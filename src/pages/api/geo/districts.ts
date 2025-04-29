import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { provinceId } = req.query

        if (!provinceId || typeof provinceId !== 'string') {
            return res.status(400).json({ error: 'Province ID is required' })
        }

        const districts = await prisma.district.findMany({
            where: { provinceId },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                code: true,
                provinceId: true
            }
        })

        return res.status(200).json({ districts })
    } catch (error) {
        console.error('Error fetching districts:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}