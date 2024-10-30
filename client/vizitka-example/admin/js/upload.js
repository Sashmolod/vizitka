async function uploadBackground() {
    const input = document.getElementById('backgroundImageInput');
    const file = input.files[0];

    // Проверяем, выбрано ли изображение
    if (!file) {
        showToast('error','Выберите файл для загрузки.');
        return;
    }

    // Проверка размера файла
    if (file.size > 2 * 1024 * 1024) { // Например, 10MB
        showToast('error','Файл не должен быть больше 2MB');
        return;
    }

    const formData = new FormData();
    formData.append('backgroundImage', file);

    const token = getToken(); // Получаем токен

    try {
        // Отправляем запрос на сервер
        const response = await fetch(`${serverAddress}/upload`, {
            method: 'POST',
            headers: {
                Authorization: `${token}`,
            },
            body: formData
        });

        // Проверяем, был ли ответ успешным
        if (!response.ok) {
            const errorText = await response.text(); // Читаем текст ошибки
            throw new Error(`Network response was not ok: ${errorText}`);
        }

        const data = await response.json(); // Читаем тело ответа

        // Проверяем, успешна ли загрузка
        if (data.success) {
            showToast('success','Фон успешно загружен!');
            //updateBackground(data.imagePath); // Обновляем фон с полученным путём к изображению
            closeCreateModal(); // Закрываем модальное окно после успешной загрузки
            setTimeout(() => {
                window.location.reload();
              }, 2000);

        } else {
            showToast('error','Ошибка загрузки фона: ' + data.message);
        }
    } catch (error) {
        // Обработка ошибок
        //console.error('Ошибка во время загрузки:', error);
        showToast('error','Произошла ошибка при загрузке изображения: ' + error.message);
    }
}
function updateBackground(imagePath) {
    const element = document.body; // или выберите нужный элемент
    element.style.backgroundImage = `url(${imagePath})`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
}