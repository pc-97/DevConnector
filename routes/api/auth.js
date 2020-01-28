const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");

const { check, validationResult } = require("express-validator");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });

        if (!user)
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid credentials" }] });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(400).json({ msg: "Invalid credentials" });
        }

        const payload = {
          user: {
            id: user.id
          }
        };

        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: 36000 },
          (err, token) => {
            if (err) throw err;
            return res.status(200).json({ token });
          }
        );
      } catch (err) {
        console.error(err.message);
        return res.status(500).send("Internal server error");
      }

      // return res.status(201).json(req.body);
    }
  }
);

module.exports = router;
