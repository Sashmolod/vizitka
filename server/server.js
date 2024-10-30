// server.js

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const {port, secretKey, storedUsername, storedPassword, client} = require('./config');
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const path = require("path");
const multer = require("multer");
const serveIndex = require('serve-index');
const app = express();
const uploadsPath = path.join(__dirname, 'uploads');
const { exec } = require("child_process");

// Проверка и создание папки для загрузок, если она не существует
console.log("Checking if 'uploads' folder exists...");
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
    console.log("'uploads' folder created.");
} else {
    console.log("'uploads' folder already exists.");
}


app.use(cors());
// Промежуточный обработчик для просмотра входящего JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); // Для обработки URL-encoded данных
app.use('/uploads', express.static('uploads')); // Папка для загруженных изображений
//app.use('/uploads', express.static(uploadsPath), serveIndex(uploadsPath, { icons: true }));
// Промежуточный обработчик для логирования запросов
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next(); // Переходим к следующему обработчику
});

// Настройка хранения загружаемых файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Папка для сохранения загруженных файлов
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    }
});

const upload = multer({
    limits: {fileSize: 2 * 1024 * 1024},
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
    }
});


const BUTTONS_FILE = path.join(__dirname, "db/button.json");


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
    } else if (!validator.isLength(name, {min: 1, max: 20})) {
        errors.push("Invalid button name length (1-20 characters).");
    }

    if (!link) {
        errors.push("Please provide a link for the button.");
    } else if (!validator.isURL(link, {protocols: ["http", "https"], require_protocol: true})) {
        errors.push("Invalid link format.");
    }

    if (!buttonText) {
        errors.push("Please provide button text.");
    } else if (!validator.isLength(buttonText, {min: 1, max: 20})) {
        errors.push("Invalid button text length (1-20 characters).");
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
    };
}

// Обработчик для корневого маршрута
app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});

app.post("/api/login", async (req, res) => {
    const {username, password} = req.body;
    const isUser = await bcrypt.compare(username, storedUsername);
    const isMatch = await bcrypt.compare(password, storedPassword);
    if (isUser && isMatch) {
        const tokenData = {
            username: username,
        };

        const token = jwt.sign(tokenData, secretKey, {expiresIn: "1h"});
        res.cookie("token", token, {httpOnly: true});
        res.json({token});
    } else {
        res.status(401).json({error: "Неверный пароль."});
    }

});


const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({message: "Access denied, token missing"});
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded; // Добавляем данные пользователя в объект запроса
        next(); // Продолжаем выполнение запроса
    } catch (error) {
        return res.status(401).json({message: "Invalid token"});
    }
};

app.get("/api/buttons", async (req, res) => {
    const buttons = readButtons();
    res.json(buttons);
});

app.post("/api/buttons", verifyToken, async (req, res) => {
    const {name, link, buttonText} = req.body;

    // Validate button data
    const validation = validateButtonData(name, link, buttonText);
    if (!validation.isValid) {
        return res.status(400).json({error: "Validation failed", errors: validation.errors});
    }

    const buttons = readButtons();
    const newButton = {id: Date.now(), name, link, buttonText};
    buttons.push(newButton);
    writeButtons(buttons);
    res.json(newButton);
});


app.put("/api/buttons/:id", verifyToken, async (req, res) => {
    const id = parseInt(req.params.id);
    const {name, link, buttonText} = req.body;

    // Validate button data
    const validation = validateButtonData(name, link, buttonText);
    if (!validation.isValid) {
        return res.status(400).json({error: "Validation failed", errors: validation.errors});
    }

    const buttons = readButtons();
    const updatedButtons = buttons.map((button) =>
        button.id === id ? {...button, name, link, buttonText} : button
    );
    writeButtons(updatedButtons);
    res.json({message: "Button updated successfully", button: getButtonById(updatedButtons, id)});
});

app.delete("/api/buttons/:id", verifyToken, async (req, res) => {
    const id = parseInt(req.params.id);
    const buttons = readButtons();
    const updatedButtons = buttons.filter((button) => button.id !== id);
    writeButtons(updatedButtons);
    res.json({message: "Button deleted successfully"});
});

app.post("/upload", verifyToken, upload.single("backgroundImage"), (req, res) => {
    console.log("Incoming file data:", req.file); // Логируем информацию о загруженном файле

    if (!req.file) {
        return res.status(400).json({success: false, message: 'No file uploaded'});
    }

    const newFilePath = path.join(uploadsPath, 'bg-img' + path.extname(req.file.originalname)); // Новый путь для сохранения

    // Проверяем, существует ли файл bg-img
    fs.access(newFilePath, fs.constants.F_OK, (err) => {
        if (!err) {
            // Файл существует, удаляем его
            fs.unlink(newFilePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting existing file:', unlinkErr);
                    return res.status(500).json({success: false, message: 'Error deleting existing file'});
                }
                console.log('Existing file deleted:', newFilePath);
                saveNewImage();
            });
        } else {
            // Файл не существует, сохраняем новое изображение
            saveNewImage();
        }
    });

    function saveNewImage() {
        const uploadedFilePath = req.file.path; // Путь к загруженному файлу

        // Переименовываем файл
        fs.promises.rename(uploadedFilePath, newFilePath)
            .then(() => {
                const imagePath = `/uploads/bg-img${path.extname(req.file.originalname)}`; // Формируем путь
                return res.json({success: true, imagePath});
            })
            .catch(err => {
                console.error('Error saving image:', err);
                return res.status(500).json({success: false, message: 'Error saving image', details: err.message});
            });
    }
});

const uploadsPathImage = path.join(__dirname, "uploads");

// Возвращаем список файлов в директории uploads
app.get('/uploads', (req, res) => {
    fs.readdir(uploadsPathImage, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }
        res.json(files); // Возвращаем список файлов в формате JSON
    });
});

// Возвращаем файл по запрашиваемому имени
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsPath, filename);

    // Проверяем, существует ли файл
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send('File not found');
        }

        // Отправляем файл
        res.sendFile(filePath);
    });
});

// Обработка ошибок для multer и других ошибок
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(500).json({success: false, message: err.message});
    } else if (err) {
        console.error("General error:", err);
        return res.status(500).json({success: false, message: err.message});
    }
    next();
});

// Вебхук для обновления репозитория
app.post('/webhook', (req, res) => {
    exec('git -C /var/www/vizitka pull', (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return res.status(500).send('Error pulling repo');
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.status(200).send('Repo updated');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});