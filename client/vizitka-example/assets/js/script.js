const serverAddress = "http://216.219.94.108:3050";

async function fetchData() {
  try {
    const response = await fetch(`${serverAddress}/api/buttons`);
    const data = await response.json();

    const buttonsContainer = document.getElementById('buttonsContainer');

    const sectionContentDiv = document.createElement('div');
    sectionContentDiv.classList.add('col-md-12', 'd-flex', 'justify-content-around', 'flex-column', 'section-content');

    data.forEach(button => {
      const sectionContentItemDiv = document.createElement('div');
      sectionContentItemDiv.classList.add('section-content-item');

      const buttonElement = document.createElement('a');
      buttonElement.classList.add('section-content-link');
      buttonElement.textContent = button.name; // Устанавливаем текст кнопки
      buttonElement.setAttribute('href', button.link); // Устанавливаем ссылку
      buttonElement.setAttribute('title', button.buttonText); // Устанавливаем текст для title

      sectionContentItemDiv.appendChild(buttonElement);
      sectionContentDiv.appendChild(sectionContentItemDiv);
    });

    buttonsContainer.appendChild(sectionContentDiv);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Вызов функции для загрузки данных при загрузке страницы
window.onload = fetchData;
