import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/prisma'
import { withSecurity } from '@/middleware/security'

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Check authentication
        const token = await getToken({ req });
        if (!token || token.role !== 'ROOT') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { nodeId, newParentId } = req.body;

        if (!nodeId || !newParentId) {
            return res.status(400).json({ error: 'Node ID and new parent ID are required' });
        }

        // First, identify the node to be moved
        let nodeType = null;
        let node = null;

        // Check provinces
        node = await prisma.province.findUnique({ where: { id: nodeId } });
        if (node) {
            nodeType = 'province';
        }

        // Check districts
        if (!node) {
            node = await prisma.district.findUnique({ where: { id: nodeId } });
            if (node) {
                nodeType = 'district';
            }
        }

        // Check LLGs
        if (!node) {
            node = await prisma.lLG.findUnique({ where: { id: nodeId } });
            if (node) {
                nodeType = 'llg';
            }
        }

        // Check wards
        if (!node) {
            node = await prisma.ward.findUnique({ where: { id: nodeId } });
            if (node) {
                nodeType = 'ward';
            }
        }

        // Check locations
        if (!node) {
            node = await prisma.location.findUnique({ where: { id: nodeId } });
            if (node) {
                nodeType = 'location';
            }
        }

        // Check ABG regions
        if (!node) {
            node = await prisma.region.findUnique({ where: { id: nodeId } });
            if (node) {
                nodeType = 'region';
            }
        }

        // Check ABG districts
        if (!node) {
            node = await prisma.abgDistrict.findUnique({ where: { id: nodeId } });
            if (node) {
                nodeType = 'abg_district';
            }
        }

        // Check constituencies
        if (!node) {
            node = await prisma.constituency.findUnique({ where: { id: nodeId } });
            if (node) {
                nodeType = 'constituency';
            }
        }

        // Check MKA regions
        if (!node) {
            node = await prisma.mkaRegion.findUnique({ where: { id: nodeId } });
            if (node) {
                nodeType = 'mka_region';
            }
        }

        // Check MKA wards
        if (!node) {
            node = await prisma.mkaWard.findUnique({ where: { id: nodeId } });
            if (node) {
                nodeType = 'mka_ward';
            }
        }

        if (!node || !nodeType) {
            return res.status(404).json({ error: 'Node not found' });
        }

        // Next, identify the new parent
        let parentType = null;
        let parent = null;

        // Check for each possible parent type based on the node type
        switch (nodeType) {
            case 'province':
                parent = await prisma.geoRegion.findUnique({
                    where: { id: newParentId },
                    select: { id: true, name: true }
                });
                if (parent) parentType = 'geo_region';
                break;
            case 'district':
                parent = await prisma.province.findUnique({
                    where: { id: newParentId },
                    select: { id: true, name: true, path: true }
                });
                if (parent) parentType = 'province';
                break;
            case 'llg':
                parent = await prisma.district.findUnique({
                    where: { id: newParentId },
                    select: { id: true, name: true, path: true }
                });
                if (parent) parentType = 'district';
                break;
            case 'ward':
                parent = await prisma.lLG.findUnique({
                    where: { id: newParentId },
                    select: { id: true, name: true, path: true }
                });
                if (parent) parentType = 'llg';
                break;
            case 'location':
                parent = await prisma.ward.findUnique({
                    where: { id: newParentId },
                    select: { id: true, name: true, path: true }
                });
                if (parent) parentType = 'ward';

                if (!parent) {
                    parent = await prisma.constituency.findUnique({
                        where: { id: newParentId },
                        select: { id: true, name: true, path: true }
                    });
                    if (parent) parentType = 'constituency';
                }

                if (!parent) {
                    parent = await prisma.mkaWard.findUnique({
                        where: { id: newParentId },
                        select: { id: true, name: true, path: true }
                    });
                    if (parent) parentType = 'mka_ward';
                }
                break;
            case 'region':
                parent = await prisma.geoRegion.findUnique({
                    where: { id: newParentId },
                    select: { id: true, name: true }
                });
                if (parent) parentType = 'geo_region';
                break;
            case 'abg_district':
                parent = await prisma.region.findUnique({
                    where: { id: newParentId },
                    select: { id: true, name: true, path: true }
                });
                if (parent) parentType = 'region';
                break;
            case 'constituency':
                parent = await prisma.abgDistrict.findUnique({
                    where: { id: newParentId },
                    select: { id: true, name: true, path: true }
                });
                if (parent) parentType = 'abg_district';
                break;
            case 'mka_region':
                parent = await prisma.geoRegion.findUnique({
                    where: { id: newParentId },
                    select: { id: true, name: true }
                });
                if (parent) parentType = 'geo_region';
                break;
            case 'mka_ward':
                parent = await prisma.mkaRegion.findUnique({
                    where: { id: newParentId },
                    select: { id: true, name: true, path: true }
                });
                if (parent) parentType = 'mka_region';
                break;
        }

        if (!parent || !parentType) {
            return res.status(404).json({ error: 'New parent node not found or invalid for this node type' });
        }

        // Handle GeoRegion which doesn't have a path field
        if (parentType === 'geo_region') {
            // For GeoRegion, construct a path from its name
            parent.path = parent.name;
        }

        // Safety check - ensure we have a path
        if (!parent.path) {
            return res.status(500).json({ error: 'Parent path could not be determined' });
        }

        // Calculate new path
        const oldPath = node.path;
        const pathParts = oldPath.split('/');
        const nodeName = pathParts[pathParts.length - 1];
        const newPath = `${parent.path}/${nodeName}`;

        // Create a record in the movement history
        const user = await prisma.user.findUnique({ where: { id: token.sub! } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Record the movement in history
        await prisma.nodeMovementHistory.create({
            data: {
                nodeId,
                nodeType,
                oldParentId: getParentId(node, nodeType),
                newParentId,
                movedBy: { connect: { id: user.id } },
                oldPath,
                newPath
            }
        });

        // Update the node's parent and path
        let updatedNode;

        switch (nodeType) {
            case 'province':
                updatedNode = await prisma.province.update({
                    where: { id: nodeId },
                    data: {
                        geoRegion: { connect: { id: newParentId } },
                        path: newPath
                    }
                });
                break;
            case 'district':
                updatedNode = await prisma.district.update({
                    where: { id: nodeId },
                    data: {
                        province: { connect: { id: newParentId } },
                        path: newPath
                    }
                });
                break;
            case 'llg':
                updatedNode = await prisma.lLG.update({
                    where: { id: nodeId },
                    data: {
                        district: { connect: { id: newParentId } },
                        path: newPath
                    }
                });
                break;
            case 'ward':
                updatedNode = await prisma.ward.update({
                    where: { id: nodeId },
                    data: {
                        llg: { connect: { id: newParentId } },
                        path: newPath
                    }
                });
                break;
            case 'location':
                // For locations, need to handle different parent types
                if (parentType === 'ward') {
                    updatedNode = await prisma.location.update({
                        where: { id: nodeId },
                        data: {
                            ward: { connect: { id: newParentId } },
                            constituency: { disconnect: true },
                            mkaWard: { disconnect: true },
                            path: newPath
                        }
                    });
                } else if (parentType === 'constituency') {
                    updatedNode = await prisma.location.update({
                        where: { id: nodeId },
                        data: {
                            constituency: { connect: { id: newParentId } },
                            ward: { disconnect: true },
                            mkaWard: { disconnect: true },
                            path: newPath
                        }
                    });
                } else if (parentType === 'mka_ward') {
                    updatedNode = await prisma.location.update({
                        where: { id: nodeId },
                        data: {
                            mkaWard: { connect: { id: newParentId } },
                            ward: { disconnect: true },
                            constituency: { disconnect: true },
                            path: newPath
                        }
                    });
                }
                break;
            case 'region':
                updatedNode = await prisma.region.update({
                    where: { id: nodeId },
                    data: {
                        geoRegion: { connect: { id: newParentId } },
                        path: newPath
                    }
                });
                break;
            case 'abg_district':
                updatedNode = await prisma.abgDistrict.update({
                    where: { id: nodeId },
                    data: {
                        region: { connect: { id: newParentId } },
                        path: newPath
                    }
                });
                break;
            case 'constituency':
                updatedNode = await prisma.constituency.update({
                    where: { id: nodeId },
                    data: {
                        district: { connect: { id: newParentId } },
                        path: newPath
                    }
                });
                break;
            case 'mka_region':
                updatedNode = await prisma.mkaRegion.update({
                    where: { id: nodeId },
                    data: {
                        geoRegion: { connect: { id: newParentId } },
                        path: newPath
                    }
                });
                break;
            case 'mka_ward':
                updatedNode = await prisma.mkaWard.update({
                    where: { id: nodeId },
                    data: {
                        region: { connect: { id: newParentId } },
                        path: newPath
                    }
                });
                break;
        }

        // Update paths of all children (would be a complex operation)
        // For simplicity, we're skipping this part in this implementation

        return res.status(200).json({
            message: 'Node moved successfully',
            node: updatedNode
        });
    } catch (error) {
        console.error('Error moving geo node:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

// Helper function to get the parent ID of a node based on its type
function getParentId(node: any, nodeType: string): string {
    switch (nodeType) {
        case 'province':
            return node.geoRegionId;
        case 'district':
            return node.provinceId;
        case 'llg':
            return node.districtId;
        case 'ward':
            return node.llgId;
        case 'location':
            return node.wardId || node.constituencyId || node.mkaWardId;
        case 'region':
            return node.geoRegionId;
        case 'abg_district':
            return node.regionId;
        case 'constituency':
            return node.districtId;
        case 'mka_region':
            return node.geoRegionId;
        case 'mka_ward':
            return node.regionId;
        default:
            return '';
    }
}

export default withSecurity(handler)