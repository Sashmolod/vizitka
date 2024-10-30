require('dotenv').config();

const port = process.env.PORT || 3050;
const secretKey = process.env.SECRET_KEY || 'admin';
const storedUsername = process.env.STORED_USERNAME || '$2b$10$uPFQPwGhgz1YtbMHKrtDQuug1WPuuUavVBBreyPulayyLFBUUMBiq'; //admin
const storedPassword = process.env.STORED_PASSWORD || '$2b$10$gzmt3I1yFwSDhfXxfMwAmuxF4.6tOA9OJewFMQVUp9S791M5BB9rG'; //admin

module.exports = {
  port,
  secretKey,
  storedUsername,
  storedPassword,
};

