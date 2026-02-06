
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to connect to DB...');
        await prisma.$connect();
        console.log('Connected.');

        const testUser = {
            phone: '9999999999',
            password: 'password123',
            name: 'Debug User',
            company: 'Debug Co',
            role: 'builder'
        };

        console.log('Attempting to create user:', testUser);
        const user = await prisma.user.create({
            data: testUser,
        });
        console.log('User created successfully:', user);

        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
    } catch (e) {
        console.error('ERROR OCCURRED:');
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
