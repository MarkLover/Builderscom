
const { PrismaClient } = require('@prisma/client');

async function main() {
    console.log('Testing PrismaClient with empty options...');
    const prisma = new PrismaClient({});
    try {
        await prisma.$connect();
        console.log('Connected successfully!');
        await prisma.$disconnect();
    } catch (e) {
        console.error('Connection failed:', e);
        process.exit(1);
    }
}

main();
