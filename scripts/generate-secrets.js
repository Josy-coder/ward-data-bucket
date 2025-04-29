const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Generate NextAuth secret
function generateNextAuthSecret() {
    return crypto.randomBytes(32).toString('hex');
}

// Generate password hash
async function generatePasswordHash(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

async function main() {
    const nextAuthSecret = generateNextAuthSecret();
    const passwordHash = await generatePasswordHash('admin123'); // You can change this default password

    console.log('\nGenerated Secrets:');
    console.log('------------------');
    console.log('NEXTAUTH_SECRET:', nextAuthSecret);
    console.log('\nRoot Password Hash:', passwordHash);
    console.log('\nAdd NEXTAUTH_SECRET to your .env file');
    console.log('Use the password hash in your seed file for the root user');
}

main().catch(console.error);