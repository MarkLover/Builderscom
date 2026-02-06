
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt'); // Try requiring bcrypt
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing bcrypt...');
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash('test', salt);
        console.log('Bcrypt hash generated:', hash);

        console.log('Attempting to connect to DB...');
        await prisma.$connect();

        const testUser = {
            phone: '8888888888',
            password: hash,
            name: 'Duplicate Test',
            company: 'Debug Co',
            role: 'builder'
        };

        console.log('Creating user first time...');
        const user1 = await prisma.user.create({ data: testUser });
        console.log('User 1 created id:', user1.id);

        console.log('Creating user second time (should fail)...');
        await prisma.user.create({ data: testUser });

    } catch (e) {
        console.log('CAUGHT ERROR:');
        console.log(e.message);
        if (e.code === 'P2002') {
            console.log('Confirmed: This is a Unique Constraint Violation (P2002)');
        }
    } finally {
        try {
            await prisma.user.deleteMany({ where: { phone: '8888888888' } });
            console.log('Cleanup done.');
        } catch (e) { }
        await prisma.$disconnect();
    }
}

main();
