import { NextApiRequest } from 'next'
import { getToken } from 'next-auth/jwt'
import { prisma } from './prisma'

export async function getCurrentTenant(req: NextApiRequest) {
    const token = await getToken({ req })

    if (!token?.tenantId) {
        return null
    }

    return prisma.tenant.findUnique({
        where: { id: token.tenantId as string },
        include: {
            district: {
                include: {
                    province: true
                }
            }
        }
    })
}

export function getTenantFromHeader(req: NextApiRequest) {
    const tenantId = req.headers['x-tenant-id']
    if (!tenantId || Array.isArray(tenantId)) {
        return null
    }
    return tenantId
}

// Use this in API routes to enforce tenant isolation
export async function withTenant(req: NextApiRequest) {
    const tenant = await getCurrentTenant(req)
    if (!tenant) {
        throw new Error('Tenant not found')
    }
    return tenant
}