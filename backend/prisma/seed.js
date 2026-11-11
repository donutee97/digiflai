const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [
      { name: "ADMIN", description: "Administrador del sistema" },
      { name: "OPERATOR", description: "Operador de drones" },
      { name: "TECHNICIAN", description: "Técnico de mantenimiento" },
      { name: "RESEARCHER", description: "Investigador / IA" }
    ],
    skipDuplicates: true
  });

  console.log("Roles creados correctamente");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
