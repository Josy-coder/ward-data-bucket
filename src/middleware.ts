import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
    const token = await getToken({ req })
    const path = req.nextUrl.pathname

    // Public paths that don't require authentication
    if (
        path === '/auth/login' ||
        path === '/auth/register' ||
        path === '/auth/forgot-password' ||
        path.startsWith('/_next') ||
        path.startsWith('/api/auth')
    ) {
        return NextResponse.next()
    }

    // Require authentication for all other routes
    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Root admin can access everything
    if (token.role === 'ROOT') {
        return NextResponse.next()
    }

    // District routes require tenant access
    if (path.startsWith('/district')) {
        if (!token.tenantId) {
            return NextResponse.redirect(new URL('/auth/error?error=unauthorized', req.url))
        }

        // Add tenant context to the request
        const requestHeaders = new Headers(req.headers)
        requestHeaders.set('x-tenant-id', token.tenantId as string)

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    }

    // Prevent non-root users from accessing root routes
    if (path.startsWith('/root') && token.role !== 'ROOT') {
        return NextResponse.redirect(new URL('/auth/error?error=unauthorized', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public directory)
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
}