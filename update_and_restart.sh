#!/bin/bash

# Путь к вашему проекту
PROJECT_DIR="/var/www/vizitka"
cd $PROJECT_DIR

# Проверяем наличие обновлений
if git fetch origin; then
    # Проверяем, находится ли HEAD на ветке master
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

    if [ "$CURRENT_BRANCH" != "master" ]; then
        echo "Игнорируем обновления, так как текущая ветка не master."
        exit 0
    fi

    # Пуллим изменения для master
    if [ $(git rev-parse HEAD) != $(git rev-parse @{u}) ]; then
        echo "Обновление найдено в ветке master, выполняем обновление..."

        # Обновляем сервер
        cd server
        git pull origin master

        # Обновляем клиент
        cd ../client
        git pull origin master

        # Перезапускаем контейнеры
        cd $PROJECT_DIR
        docker-compose down
        docker-compose up -d --build

        echo "Контейнеры перезапущены."
    else
        echo "Обновлений нет в ветке master."
    fi
else
    echo "Ошибка при получении обновлений."
fi
