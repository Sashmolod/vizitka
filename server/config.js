require('dotenv').config();

const port = process.env.PORT;
const secretKey = process.env.SECRET_KEY;
const storedUsername = process.env.STORED_USERNAME;
const storedPassword = process.env.STORED_PASSWORD;

module.exports = {
  port,
  secretKey,
  storedUsername,
  storedPassword,
};

