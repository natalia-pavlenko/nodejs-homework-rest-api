const { HttpErrors } = require("../helpers");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = process.env;

const checkAuth = async (req, res, next) => {
  try {
    const headerAuth = req.headers.authorization || "";
    if (!headerAuth) {
   
      throw HttpErrors(401, "Not authorized");
    }

    const [bearer, token] = await headerAuth.split(" ", 2);

    if (bearer !== "Bearer") {
      console.log("error");
      throw HttpErrors(401, "Not authorized");
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        throw HttpErrors(401, "Not authorized");
      }

      req.userId = decoded;
      next();
    });
  } catch (error) {
    next(error);
  }
};

module.exports = checkAuth;
