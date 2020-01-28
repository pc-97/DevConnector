const jwt = require("jsonwebtoken");
const config = require("config");

function checkJWT(req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;
    res.status(401).json({ msg: "token is not valid" });
  }
}

module.exports = checkJWT;
