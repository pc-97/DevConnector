const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const config = require("config");

router.post(
  "/",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password of 6 or more length").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });

        if (user)
          return res
            .status(400)
            .json({ errors: [{ msg: "User already present in system" }] });

        const avatar = gravatar.url(email, {
          s: "200",
          r: "pg",
          d: "mm"
        });
        const salt = await bcrypt.genSalt(10);

        user = new User({
          name,
          email,
          avatar,
          password
        });

        user.password = await bcrypt.hash(password, salt);
        console.log(`id is >> ${user.id}`);
        await user.save();
        user.password = "";

        //else do something
        // User.insertOne(req.);
        // add jwt to the response

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
