const authService = require("../services/auth.service");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

class AuthController {
  async register(req, res) {
    try {
      const { error } = registerSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          message: error.details[0].message
        });
      }

      const result = await authService.register(req.body);

      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async login(req, res) {
    try {
      const { error } = loginSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          message: error.details[0].message
        });
      }

      const result = await authService.login(
        req.body.email,
        req.body.password
      );

      res.json(result);
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  }
}

module.exports = new AuthController();
