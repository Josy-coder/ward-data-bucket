import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { withSecurity } from '@/middleware/security';
import { getTenantFromHeader } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check authentication
        const token = await getToken({ req });
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get file ID from URL
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'File ID is required' });
        }

        // Get tenant ID
        const tenantId = getTenantFromHeader(req);

        // Find the file in the database
        const file = await prisma.file.findUnique({
            where: { id },
            include: {
                tenant: true,
                dataBucket: {
                    include: {
                        ward: true,
                        dataPeriod: true
                    }
                }
            }
        });

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Check if user has access to this file
        if (token.role === 'USER' || token.role === 'ADMIN') {
            // For regular users and tenant admins, check if file belongs to their tenant
            if (tenantId && file.tenantId !== tenantId) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        // ROOT users can access all files

        // Generate presigned URL for the file
        const url = await getFileUrl(file.path);

        return res.status(200).json({
            url,
            filename: file.filename,
            type: file.type,
            description: file.description,
            createdAt: file.createdAt
        });
    } catch (error) {
        console.error('Error generating download URL:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default withSecurity(handler);