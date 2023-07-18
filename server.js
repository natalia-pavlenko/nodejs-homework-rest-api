const app = require('./app')
const mongoose = require("mongoose")

const {HOST_DB, PORT = 4009 } = process.env;

mongoose
.connect(HOST_DB)
.then(() => {
  app.listen(PORT);
    console.log("Database connection successful")
})
.catch((error) => {
  console.log(error.message);
  process.exit(1);
});
