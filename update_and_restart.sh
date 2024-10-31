#!/bin/bash

# Путь к вашему проекту
PROJECT_DIR="/var/www/vizitka"

cd $PROJECT_DIR

# Проверяем наличие обновлений
if git fetch origin && [ $(git rev-parse HEAD) != $(git rev-parse @{u}) ]; then
    echo "Обновление найдено, выполняем обновление..."

    # Обновляем сервер
    cd server
    git pull

    # Обновляем клиент
    cd ../client
    git pull

    # Перезапускаем контейнеры
    cd $PROJECT_DIR
    docker-compose down
    docker-compose up -d --build

    echo "Контейнеры перезапущены."
else
    echo "Обновлений нет."
fi
