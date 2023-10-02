async function fetchData() {
  try {
    const response = await fetch('http://localhost:3050/api/buttons');
    const data = await response.json();
    
    const buttonsContainer = document.getElementById('buttonsContainer');
    
    data.forEach(button => {
      const buttonElement = document.createElement('a');
      buttonElement.textContent = button.name;
      buttonElement.setAttribute('href', button.link);
      buttonElement.setAttribute('title', button.buttonText);  // Добавляем комментарий как title
      buttonsContainer.appendChild(buttonElement);
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Вызов функции для загрузки данных при загрузке страницы
window.onload = fetchData;
