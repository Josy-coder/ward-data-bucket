import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/prisma'
import { withSecurity } from '@/middleware/security'

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Check authentication
        const token = await getToken({ req });
        if (!token || token.role !== 'ROOT') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { name, code, type, parentId, region } = req.body;

        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }

        // Find the correct parent based on type and parentId
        let parent: any = null;
        let path = '';
        let level = 0;

        if (parentId) {
            // Find parent based on type
            switch (type) {
                case 'province':
                    parent = await prisma.geoRegion.findUnique({ where: { id: parentId } });
                    break;
                case 'district':
                    parent = await prisma.province.findUnique({ where: { id: parentId } });
                    break;
                case 'llg':
                    parent = await prisma.district.findUnique({ where: { id: parentId } });
                    break;
                case 'ward':
                    parent = await prisma.lLG.findUnique({ where: { id: parentId } });
                    break;
                case 'village':
                    parent = await prisma.ward.findUnique({ where: { id: parentId } });
                    break;
                case 'region':
                    parent = await prisma.geoRegion.findUnique({ where: { id: parentId } });
                    break;
                case 'constituency':
                    parent = await prisma.abgDistrict.findUnique({ where: { id: parentId } });
                    break;
                case 'section':
                    parent = await prisma.mkaWard.findUnique({ where: { id: parentId } });
                    break;
            }

            if (!parent) {
                return res.status(400).json({ error: 'Parent node not found' });
            }

            path = `${parent.path}/${name}`;
            level = parent.level + 1;
        } else {
            // Creating a root level node
            path = `${region}/${name}`;
            level = 0;

            // Check if the geo region exists
            const geoRegion = await prisma.geoRegion.findFirst({
                where: { name: region }
            });

            if (!geoRegion) {
                return res.status(400).json({ error: 'Region not found' });
            }

            parent = geoRegion;
        }

        // Create the new node based on type
        let newNode;

        switch (type) {
            case 'province':
                newNode = await prisma.province.create({
                    data: {
                        name,
                        code,
                        geoRegion: { connect: { id: parent.id } },
                        path,
                        level
                    }
                });
                break;
            case 'district':
                newNode = await prisma.district.create({
                    data: {
                        name,
                        code,
                        province: { connect: { id: parent.id } },
                        path,
                        level
                    }
                });
                break;
            case 'llg':
                newNode = await prisma.lLG.create({
                    data: {
                        name,
                        code,
                        district: { connect: { id: parent.id } },
                        path,
                        level
                    }
                });
                break;
            case 'ward':
                newNode = await prisma.ward.create({
                    data: {
                        name,
                        code,
                        llg: { connect: { id: parent.id } },
                        villages: [],
                        path,
                        level
                    }
                });
                break;
            case 'village':
                // For villages, we first add them to the ward's villages array
                await prisma.ward.update({
                    where: { id: parent.id },
                    data: {
                        villages: {
                            push: name
                        }
                    }
                });

                // Then create the location record
                newNode = await prisma.location.create({
                    data: {
                        name,
                        code,
                        ward: { connect: { id: parent.id } },
                        path,
                        level
                    }
                });
                break;
            case 'region':
                newNode = await prisma.region.create({
                    data: {
                        name,
                        code,
                        geoRegion: { connect: { id: parent.id } },
                        path,
                        level
                    }
                });
                break;
            case 'district': // ABG district
                newNode = await prisma.abgDistrict.create({
                    data: {
                        name,
                        code,
                        region: { connect: { id: parent.id } },
                        path,
                        level
                    }
                });
                break;
            case 'constituency':
                newNode = await prisma.constituency.create({
                    data: {
                        name,
                        code,
                        district: { connect: { id: parent.id } },
                        villages: [],
                        path,
                        level
                    }
                });
                break;
            case 'ward': // MKA ward
                newNode = await prisma.mkaWard.create({
                    data: {
                        name,
                        code,
                        region: { connect: { id: parent.id } },
                        sections: [],
                        path,
                        level
                    }
                });
                break;
            case 'section':
                // For sections, we first add them to the ward's sections array
                await prisma.mkaWard.update({
                    where: { id: parent.id },
                    data: {
                        sections: {
                            push: name
                        }
                    }
                });

                // Then create the location record
                newNode = await prisma.location.create({
                    data: {
                        name,
                        code,
                        mkaWard: { connect: { id: parent.id } },
                        path,
                        level
                    }
                });
                break;
            default:
                return res.status(400).json({ error: 'Invalid node type' });
        }

        return res.status(201).json({
            message: 'Node created successfully',
            node: newNode
        });
    } catch (error) {
        console.error('Error creating geo node:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default withSecurity(handler)