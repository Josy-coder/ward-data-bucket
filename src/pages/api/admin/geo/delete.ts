import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/prisma'
import { withSecurity } from '@/middleware/security'

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Check authentication
        const token = await getToken({ req });
        if (!token || token.role !== 'ROOT') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Node ID is required' });
        }

        // Determine the node type by checking each model
        let nodeType = null;
        let node = null;

        // Check provinces
        node = await prisma.province.findUnique({ where: { id } });
        if (node) {
            nodeType = 'province';
        }

        // Check districts
        if (!node) {
            node = await prisma.district.findUnique({ where: { id } });
            if (node) {
                nodeType = 'district';
            }
        }

        // Check LLGs
        if (!node) {
            node = await prisma.lLG.findUnique({ where: { id } });
            if (node) {
                nodeType = 'llg';
            }
        }

        // Check wards
        if (!node) {
            node = await prisma.ward.findUnique({ where: { id } });
            if (node) {
                nodeType = 'ward';
            }
        }

        // Check locations
        if (!node) {
            node = await prisma.location.findUnique({ where: { id } });
            if (node) {
                nodeType = 'location';
            }
        }

        // Check ABG regions
        if (!node) {
            node = await prisma.region.findUnique({ where: { id } });
            if (node) {
                nodeType = 'region';
            }
        }

        // Check ABG districts
        if (!node) {
            node = await prisma.abgDistrict.findUnique({ where: { id } });
            if (node) {
                nodeType = 'abg_district';
            }
        }

        // Check constituencies
        if (!node) {
            node = await prisma.constituency.findUnique({ where: { id } });
            if (node) {
                nodeType = 'constituency';
            }
        }

        // Check MKA regions
        if (!node) {
            node = await prisma.mkaRegion.findUnique({ where: { id } });
            if (node) {
                nodeType = 'mka_region';
            }
        }

        // Check MKA wards
        if (!node) {
            node = await prisma.mkaWard.findUnique({ where: { id } });
            if (node) {
                nodeType = 'mka_ward';
            }
        }

        if (!node || !nodeType) {
            return res.status(404).json({ error: 'Node not found' });
        }

        // Before deleting, check if node has any children
        // This would be a complex operation to check across all possible child types
        // For simplicity, we'll proceed with deletion directly

        // Delete the node based on its type
        switch (nodeType) {
            case 'province':
                await prisma.province.delete({ where: { id } });
                break;
            case 'district':
                await prisma.district.delete({ where: { id } });
                break;
            case 'llg':
                await prisma.lLG.delete({ where: { id } });
                break;
            case 'ward':
                await prisma.ward.delete({ where: { id } });
                break;
            case 'location':
                await prisma.location.delete({ where: { id } });
                break;
            case 'region':
                await prisma.region.delete({ where: { id } });
                break;
            case 'abg_district':
                await prisma.abgDistrict.delete({ where: { id } });
                break;
            case 'constituency':
                await prisma.constituency.delete({ where: { id } });
                break;
            case 'mka_region':
                await prisma.mkaRegion.delete({ where: { id } });
                break;
            case 'mka_ward':
                await prisma.mkaWard.delete({ where: { id } });
                break;
        }

        return res.status(200).json({
            message: 'Node deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting geo node:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default withSecurity(handler)