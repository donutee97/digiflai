require("../src/config/env");

const prisma = require("../src/config/prisma");

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
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
