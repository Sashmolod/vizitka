# Используем официальный образ Node.js
FROM node:14

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все остальные файлы из папки server
COPY server/ ./server

# Устанавливаем рабочую директорию для приложения (папка server)
WORKDIR /usr/src/app/server

# Экспонируем порт, на котором работает приложение
EXPOSE 3050

# Запускаем приложение
CMD ["node", "server.js"]
