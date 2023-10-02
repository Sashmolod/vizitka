require('dotenv').config();

const port = process.env.PORT || 3050;
const secretKey = process.env.SECRET_KEY || 'admin';
const storedUsername = process.env.STORED_USERNAME || 'admin';
const storedPassword = process.env.STORED_PASSWORD || 'admin';

module.exports = {
  port,
  secretKey,
  storedUsername,
  storedPassword,
};

