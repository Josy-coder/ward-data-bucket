import * as crypto from 'crypto'

export function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex')
}

export function generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex')
}