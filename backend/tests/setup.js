const mongoose = require("mongoose");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

beforeAll(async () => {
    await prisma.$connect();
    await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/digiflai_telemetry_test");
});

afterAll(async () => {
    await prisma.$disconnect();
    await mongoose.connection.close();
});

afterEach(async () => {
    const modelNames = ['alert', 'maintenance', 'mission', 'drone', 'user', 'role'];
    for (const modelName of modelNames) {
        if (prisma[modelName] && typeof prisma[modelName].deleteMany === 'function') {
            await prisma[modelName].deleteMany();
        }
    }
    
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});