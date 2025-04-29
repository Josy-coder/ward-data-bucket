import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import rateLimit from 'express-rate-limit'
import { getToken } from 'next-auth/jwt'

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
})

// CSRF Protection
const validateCSRF = async (req: NextApiRequest) => {
    const token = req.headers['x-csrf-token']
    // Compare with session token or validate against stored tokens
    return !!token
}

// Security headers
const securityHeaders = {
    'Content-Security-Policy':
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

// Middleware composer
export function withSecurity(handler: NextApiHandler) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            // Apply rate limiting
            await new Promise((resolve) => limiter(req, res, resolve))

            // Add security headers
            Object.entries(securityHeaders).forEach(([key, value]) => {
                res.setHeader(key, value)
            })

            // Validate CSRF for mutating requests
            if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method || '')) {
                const isValidCSRF = await validateCSRF(req)
                if (!isValidCSRF) {
                    return res.status(403).json({ error: 'Invalid CSRF token' })
                }
            }

            // Check for required headers
            if (!req.headers['content-type']?.includes('application/json') && req.method !== 'GET') {
                return res.status(415).json({ error: 'Unsupported Media Type' })
            }

            return handler(req, res)
        } catch (error) {
            console.error('Security middleware error:', error)
            return res.status(500).json({ error: 'Internal server error' })
        }
    }
}