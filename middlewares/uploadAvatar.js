const multer = require ('multer');
const path = require('path');

const avatarDir = path.join(__dirname,'..','tmp');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
    
  });
  
  const uploadAvatar = multer({
    storage: storage,
  });

  module.exports = uploadAvatar
