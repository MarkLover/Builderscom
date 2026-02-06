
const { PrismaClient } = require('@prisma/client');

const url = 'postgresql://postgres:228228WartWart123)1@localhost:5432/builders';

async function main() {
    console.log('Testing PrismaClient with explicit datasource...');
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    });

    try {
        await prisma.$connect();
        console.log('Connected successfully!');
        await prisma.$disconnect();
    } catch (e) {
        console.error('Connection failed:', e);
    }
}

main();
