// Получаем фоновое изображение с сервера
fetch('http://localhost:3050/uploads/bg-img.jpg') // Замените на нужный вам путь
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob(); // Получаем изображение как Blob
    })
    .then(imageBlob => {
        const imageUrl = URL.createObjectURL(imageBlob); // Создаем URL для изображения
        document.body.style.backgroundImage = `url(${imageUrl})`;
    })
    .catch(error => {
        console.error('Ошибка при получении изображения:', error);
    });
