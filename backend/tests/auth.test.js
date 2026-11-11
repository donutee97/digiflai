const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");
const bcrypt = require("bcrypt");

describe("Auth API", () => {
    let testUser;
    let testRole;

    beforeAll(async () => {
        testRole = await prisma.role.create({
            data: {
                name: "TEST_ROLE",
                description: "Test role"
            }
        });

        const hashedPassword = await bcrypt.hash("password123", 10);
        testUser = await prisma.user.create({
            data: {
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                password: hashedPassword,
                roleId: testRole.id
            }
        });
    });

    afterAll(async () => {
        await prisma.user.delete({ where: { id: testUser.id } });
        await prisma.role.delete({ where: { id: testRole.id } });
    });

    describe("POST /api/auth/login", () => {
        it("should return token for valid credentials", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "test@example.com",
                    password: "password123"
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
            expect(response.body).toHaveProperty("user");
            expect(response.body.user.email).toBe("test@example.com");
        });

        it("should return 401 for invalid password", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "test@example.com",
                    password: "wrongpassword"
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("Credenciales inválidas");
        });

        it("should return 401 for non-existent user", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "nonexistent@example.com",
                    password: "password123"
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("Credenciales inválidas");
        });
    });

    describe("POST /api/auth/register", () => {
        it("should register a new user", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    firstName: "New",
                    lastName: "User",
                    email: "newuser@example.com",
                    password: "password123",
                    roleId: testRole.id
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("token");
            expect(response.body.user.email).toBe("newuser@example.com");

            await prisma.user.delete({ where: { email: "newuser@example.com" } });
        });

        it("should return 400 for duplicate email", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    firstName: "Test",
                    lastName: "User",
                    email: "test@example.com",
                    password: "password123",
                    roleId: testRole.id
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("El correo ya está registrado");
        });

        it("should return 400 for missing required fields", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    firstName: "Test"
                });

            expect(response.status).toBe(400);
        });
    });
});

describe("Health Check", () => {
    it("should return OK status", async () => {
        const response = await request(app).get("/health");
        expect(response.status).toBe(200);
        expect(response.body.status).toBe("ok");
    });
});