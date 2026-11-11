const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role.name
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
};

module.exports = { generateToken };
