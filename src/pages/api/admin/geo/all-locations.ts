import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/prisma'
import { withSecurity } from '@/middleware/security'

// Helper function to build a tree structure
function buildLocationTree(locations: any[]) {
    // Create a map for fast lookup by id
    const locationMap = new Map();

    // First pass: create nodes without children
    locations.forEach(location => {
        locationMap.set(location.id, {
            ...location,
            children: [],
            type: getNodeType(location),
            parentId: getParentId(location)
        });
    });

    // Second pass: build the hierarchy
    const rootNodes: any[] = [];

    locationMap.forEach(node => {
        if (node.parentId) {
            const parent = locationMap.get(node.parentId);
            if (parent) {
                parent.children.push(node);
            } else {
                // If parent doesn't exist (should not happen), treat as root
                rootNodes.push(node);
            }
        } else {
            // Root level nodes
            rootNodes.push(node);
        }
    });

    // Sort children by order field
    locationMap.forEach(node => {
        node.children.sort((a: any, b: any) => a.order - b.order);
    });

    return rootNodes.sort((a, b) => a.order - b.order);
}

// Helper function to get node type
function getNodeType(node: any): string {
    if (node.provinces) return 'region';
    if (node.districts) return 'province';
    if (node.llgs) return 'district';
    if (node.wards) return 'llg';
    if (node.villages) return 'ward';
    return 'location';
}

// Helper function to get parent ID
function getParentId(node: any): string | null {
    if (node.geoRegionId) return node.geoRegionId;
    if (node.provinceId) return node.provinceId;
    if (node.districtId) return node.districtId;
    if (node.llgId) return node.llgId;
    if (node.wardId) return node.wardId;
    return null;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Check authentication
        const token = await getToken({ req });
        if (!token || token.role !== 'ROOT') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Fetch all geo regions
        const geoRegions = await prisma.geoRegion.findMany({
            include: {
                provinces: {
                    include: {
                        districts: {
                            include: {
                                llgs: {
                                    include: {
                                        wards: {
                                            include: {
                                                locations: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                regions: {
                    include: {
                        districts: {
                            include: {
                                constituencies: {
                                    include: {
                                        locations: true
                                    }
                                }
                            }
                        }
                    }
                },
                mkaRegions: {
                    include: {
                        wards: {
                            include: {
                                locations: true
                            }
                        }
                    }
                }
            }
        });

        // Build tree structure
        const locationTree = buildLocationTree(geoRegions);

        return res.status(200).json({ locations: locationTree });
    } catch (error) {
        console.error('Error fetching geo data:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default withSecurity(handler)