declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            tenantId: string
        }
    }

    interface User {
        role: string
        tenantId: string
    }
}
