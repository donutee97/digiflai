const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const { generateToken } = require("../utils/jwt");

class AuthService {
  async register(data) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new Error("El correo ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        roleId: data.roleId
      },
      include: { role: true }
    });

    const token = generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name
      }
    };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error("Credenciales inválidas");
    }

    const token = generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name
      }
    };
  }
}

module.exports = new AuthService();
