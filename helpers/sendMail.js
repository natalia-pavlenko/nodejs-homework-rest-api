const sgMail = require("@sendgrid/mail");

const {SEND_GRID_KEY} = process.env;

sgMail.setApiKey(SEND_GRID_KEY);

const sendMail = async (data) => {
    const email = {... data, from: "npavl56@gmail.com"}
    sgMail.send(email);

    return true
}

module.exports = {
   sendMail 
};