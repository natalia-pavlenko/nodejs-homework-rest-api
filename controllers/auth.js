const { UserModel } = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { HttpErrors, hlpWrapper } = require("../helpers");
const gravatar = require("gravatar");
const crypto = require("crypto");
const path = require("path");
const Jimp = require("jimp");
const fs = require("fs/promises");
const { nanoid } = require("nanoid");
const { sendMail } = require("../helpers/sendMail");

const {BASE_URL} = process.env

const avatarDir = path.join(__dirname, "..", "public", "avatars");

const { SECRET_KEY } = process.env;
const registerUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (user) {
    throw HttpErrors(409, "User already exist");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  // console.log(hashPassword);
  const avatarURL = gravatar.url(email);

  const verificationToken = nanoid();

  const creatUser = await UserModel.create({
    password: hashPassword,
    email,
    avatarURL,
    verificationToken,
  });
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href= "${BASE_URL}/users/verify/${verificationToken}">Verify email</a> `
  }
  await sendMail (verifyEmail);
  if (!creatUser) {
    throw HttpErrors(400, "Something went wrong");
  }
  const payload = {
    id: creatUser._id,
  };

  const token = await jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });

  const updateTokenUser = await UserModel.findByIdAndUpdate(
    creatUser._id,
    { token },
    { new: true }
  );

  res.status(201).json(updateTokenUser);
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw HttpErrors(401, "Email or password is wrong");
  }
if(!user.verify) {
  throw HttpErrors(401, "User not verify")
}
  const isValidePass = await bcrypt.compare(password, user.password);
  if (!isValidePass) {
    throw HttpErrors(401, "Email or password is wrong");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const payload = {
    id: user._id,
  };
  const token = await jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });

  const updateUser = await UserModel.findByIdAndUpdate(user._id, {
    token,
    password: hashPassword,
  });

  res.json(updateUser);
};

const logoutUser = async (req, res) => {
  const { id } = req.userId;
  const user = await UserModel.findByIdAndUpdate(
    id,
    { token: " " },
    { new: true }
  );
  if (!user) {
    throw HttpErrors(404, "Not found");
  }
  res.status(204);
};

const getCurrentUser = async (req, res) => {
  const { id } = req.userId;
  const user = await UserModel.findById(id);
  if (!user) {
    throw HttpErrors(401, "Not authorized");
  }
  res.json(user);
};

const userUploadAvatar = async (req, res) => {
  const { id } = req.userId;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${crypto.randomUUID()}_${originalname}`;

  const resultUpload = path.join(avatarDir, filename);

  await Jimp.read(resultUpload)
    .then((filename) => {
      return filename.resize(250, Jimp.AUTO).writeAsync(resultUpload);
    })
    .catch((err) => {
      console.error(err);
    });

  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatar", filename);
  await UserModel.findByIdAndUpdate(id, { avatarURL });

  res.json(avatarURL);
};
const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await UserModel.findOne({ verificationToken });
  if (!user) {
    throw HttpErrors(401, "Email not found");
  }
  await UserModel.findByIdAndUpdate(user._id, {
    verificationToken: " ",
    verify: true,
  });

  res.json({
    message: "Verification successful",
  });
};

const resendVerifyEmail = async(req, res) =>{
   const {email} = req.body;
   const user = await UserModel.findOne({email});
   if(!user) {
    throw HttpErrors(404, "Email not found");
   }
   if(user.verify) {
    throw HttpErrors(400, "Verification has already been passed");
   }
   const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href= "${BASE_URL}/users/verify/${user.verificationToken}">Verify email</a> `
  }

  await sendMail(verifyEmail);
  res.json({
    message: "Verification email sent"
  })
}

module.exports = {
  registerUser: hlpWrapper(registerUser),
  loginUser: hlpWrapper(loginUser),
  logoutUser: hlpWrapper(logoutUser),
  getCurrentUser: hlpWrapper(getCurrentUser),
  userUploadAvatar: hlpWrapper(userUploadAvatar),
  verifyEmail: hlpWrapper(verifyEmail),
  resendVerifyEmail: hlpWrapper(resendVerifyEmail),
};
