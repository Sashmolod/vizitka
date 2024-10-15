async function uploadBackground() {
    console.log("Upload function started");
    const input = document.getElementById('backgroundImageInput');
    const file = input.files[0];

    // Проверяем, выбрано ли изображение
    if (!file) {
        alert('Please select an image to upload.');
        return;
    }

    // Проверка размера файла
    if (file.size > 10 * 1024 * 1024) { // Например, 10MB
        alert('File size exceeds 10MB');
        return;
    }

    const formData = new FormData();
    formData.append('backgroundImage', file);

    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }

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
            alert('Background image uploaded successfully!');
            //updateBackground(data.imagePath); // Обновляем фон с полученным путём к изображению
            closeCreateModal(); // Закрываем модальное окно после успешной загрузки
            setTimeout(() => {
                window.location.href = `${window.location.href}?t=${new Date().getTime()}`;
            }, 100);

        } else {
            alert('Error uploading image: ' + data.message);
        }
    } catch (error) {
        // Обработка ошибок
        console.error('Error during upload:', error);
        alert('An error occurred while uploading the image: ' + error.message);
    }
}
function updateBackground(imagePath) {
    const element = document.body; // или выберите нужный элемент
    element.style.backgroundImage = `url(${imagePath})`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
}