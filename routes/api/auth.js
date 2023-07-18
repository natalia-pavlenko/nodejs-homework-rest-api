const router = require("express").Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  userUploadAvatar,
} = require("../../controllers/auth");

const {checkAuth, validateSchema, uploadAvatar } = require("../../middlewares");

const { userSchema } = require("../../schemas/users");



router.post("/register", validateSchema(userSchema), registerUser);

router.post("/login", validateSchema(userSchema), loginUser);

router.post("/logout", checkAuth, logoutUser);

router.get("/current", checkAuth, getCurrentUser);

router.patch("/avatars", checkAuth, uploadAvatar.single('avatar'), userUploadAvatar);


module.exports = router;
