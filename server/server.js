// server.js

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const { port, secretKey, storedUsername, storedPassword } = require('./config');
const validator = require("validator");
const jwt = require("jsonwebtoken");
const app = express();

app.use(cors());

// Промежуточный обработчик для просмотра входящего JSON
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log("Incoming JSON:", req.body);
  next(); // Переходим к следующему обработчику
});

const BUTTONS_FILE = "db/button.json";

const readButtons = () => {
  try {
    const data = fs.readFileSync(BUTTONS_FILE);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeButtons = (buttons) => {
  fs.writeFileSync(BUTTONS_FILE, JSON.stringify(buttons));
};

const getButtonById = (buttons, id) => {
  return buttons.find((button) => button.id === id);
};

function validateButtonData(name, link, buttonText) {
  const errors = [];

  if (!name) {
    errors.push("Please provide a button name.");
  } else if (!validator.isLength(name, { min: 1, max: 20 })) {
    errors.push("Invalid button name length (1-20 characters).");
  }

  if (!link) {
    errors.push("Please provide a link for the button.");
  } else if (!validator.isURL(link, { protocols: ["http", "https"], require_protocol: true })) {
    errors.push("Invalid link format.");
  }

  if (!buttonText) {
    errors.push("Please provide button text.");
  } else if (!validator.isLength(buttonText, { min: 1, max: 20 })) {
    errors.push("Invalid button text length (1-20 characters).");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Проверка логина и пароля
  if (username === storedUsername && password === storedPassword) {
    // Подготовка данных для токена
    const tokenData = {
      username:username, // Используем правильное значение username
      // другие данные, которые вы хотите поместить в токен
    };

    // Генерация токена
    const token = jwt.sign(tokenData, secretKey, { expiresIn: "1h" });
    console.log("Generated token:", token); 
    // Установка токена в cookies с флагом HttpOnly
    res.cookie("token", token, { httpOnly: true });
    res.json({ token }); // Изменили на JSON
  } else {
    res.status(401).json({ error: "Неверное имя пользователя или пароль." }); // Изменили на JSON
  }
});

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access denied, token missing" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Добавляем данные пользователя в объект запроса
    next(); // Продолжаем выполнение запроса
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/api/buttons", async(req, res) => {
  const buttons = readButtons();
  res.json(buttons);
});

app.post("/api/buttons", verifyToken, async (req, res) => {
  const { name, link, buttonText } = req.body;

  // Validate button data
  const validation = validateButtonData(name, link, buttonText);
  if (!validation.isValid) {
    return res.status(400).json({ error: "Validation failed", errors: validation.errors });
  }

  const buttons = readButtons();
  const newButton = { id: Date.now(), name, link, buttonText };
  buttons.push(newButton);
  writeButtons(buttons);
  res.json(newButton);
});


app.put("/api/buttons/:id", verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, link, buttonText } = req.body;

  // Validate button data
  const validation = validateButtonData(name, link, buttonText);
  if (!validation.isValid) {
    return res.status(400).json({ error: "Validation failed", errors: validation.errors });
  }

  const buttons = readButtons();
  const updatedButtons = buttons.map((button) =>
    button.id === id ? { ...button, name, link, buttonText } : button
  );
  writeButtons(updatedButtons);
  res.json({ message: "Button updated successfully", button: getButtonById(updatedButtons, id) });
});

app.delete("/api/buttons/:id", verifyToken, async(req, res) => {
  const id = parseInt(req.params.id);
  const buttons = readButtons();
  const updatedButtons = buttons.filter((button) => button.id !== id);
  writeButtons(updatedButtons);
  res.json({ message: "Button deleted successfully" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
