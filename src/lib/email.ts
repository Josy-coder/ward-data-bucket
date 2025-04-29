import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
})

export async function sendVerificationEmail(email: string) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${generateVerificationToken()}`

    await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: 'Verify your email address',
        html: `
      <p>Please click the link below to verify your email address:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    `
    })
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

    await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: 'Reset your password',
        html: `
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, please ignore this email.</p>
    `
    })
}

export async function sendPasswordResetNotification(email: string, newPassword: string) {
    await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: 'Your password has been reset',
        html: `
      <p>Your password has been reset by an administrator.</p>
      <p>Your new password is: <strong>${newPassword}</strong></p>
      <p>Please change your password after logging in.</p>
    `
    })
}

function generateVerificationToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}