function openModal() {
  const token = getToken();

  // Проверим, есть ли токен в Local Storage
  if (token) {
    // Если токен есть, скроем кнопку "Вход" и покажем кнопку "Выход"
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("logoutButton").style.display = "block";

    getExistingButtons();
  } else {
    // Иначе, скроем кнопку "Выход" и покажем кнопку "Вход"
    document.getElementById("loginButton").style.display = "block";
    document.getElementById("logoutButton").style.display = "none";

    // Откроем модальное окно для входа
    const modal = document.getElementById("myModal");
    modal.style.display = "block";
  }
}

function closeModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "none";
}

async function authenticate() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3050/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      // Authentication successful
      const data = await response.json();
      console.log("Received data from server:", data);
      const token = data.token;
      console.log("Received token:", token);
      localStorage.setItem("token", JSON.stringify(token)); // Сохраняем токен в Local Storage

      // Закрываем модальное окно
      closeModal();
      // Показываем сообщение об успешной аутентификации
      showToast('Авторизация успешна!');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      // Обновляем список кнопок после успешной авторизации
      getExistingButtons();


      // Показываем кнопку "Создать" и таблицу
      document.getElementById("createButton").style.display = "block";
      document.getElementById("tableContent").style.display = "block";
      // Скрываем кнопку "Вход"
      document.getElementById("loginButton").style.display = "none";
      // Показываем кнопку "Выход"
      document.getElementById("logoutButton").style.display = "block";
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      const data = await response.json();
      alert("Authentication failed: " + data.error);
    }
  } catch (error) {
    console.error("Error during authentication:", error);
  }
}

function isValidInput(input) {
  return input !== null && input.trim() !== "";
}

async function createButton() {
  try {
    const name = prompt("Enter button name:");
    const link = prompt("Enter button link:");
    const buttonText = prompt("Enter button text:");

    if (name && link && buttonText) {
      const newButton = { name, link, buttonText };
      const token = getToken(); // Получаем токен

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(newButton),
      };

      const response = await fetch(
        "http://localhost:3050/api/buttons",
        requestOptions,
      );

      if (response.ok) {
        // Перезагрузить страницу после успешного создания
        window.location.reload();
        showToast('Кнопка создана успешно!');
      } else {
        // Обработка ошибок с выводом сообщения об ошибке
        const data = await response.json();
        alert("Error creating button: " + data.error);
      }
    } else {
      alert("Please provide valid name, link, and button text.");
    }
  } catch (error) {
    // Обработка ошибок с выводом сообщения об ошибке
    alert("Error creating button: " + error.message);
  }
}

function updateButtonTable(id, name, link) {
  const buttonTable = document.getElementById("buttonTable");
  const newRow = buttonTable.insertRow();
  newRow.setAttribute("data-id", id);
  const cell0 = newRow.insertCell(0); // Добавлен этот блок для вывода id
  const cell1 = newRow.insertCell(1);
  const cell2 = newRow.insertCell(2);
  const cell3 = newRow.insertCell(3); // Добавлен этот блок для вывода id

  cell0.innerHTML = id; // Добавлен этот блок для вывода id
  cell1.innerHTML = name;
  cell2.innerHTML = link;
  cell3.innerHTML = `
    <button onclick="editButton('${id}', '${name}', '${link}')">Edit</button>
    <button onclick="deleteButton('${id}')">Delete</button>
  `;
}

async function editButton(buttonId, name, link, buttonText) {
  try {
    const newName = prompt("Enter new name:", name);
    const newLink = prompt("Enter new link:", link);
    const newButtonText = prompt("Enter new button text:", buttonText);

    if (newName !== null && newLink !== null && newButtonText !== null) {
      const updatedButton = {
        name: newName,
        link: newLink,
        buttonText: newButtonText,
      };

      
      const token = getToken(); // Получаем токен

      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(updatedButton),
      };
      const response = await fetch(
        `http://localhost:3050/api/buttons/${buttonId}`,
        requestOptions,
      );

      if (response.ok) {
        // Перезагрузить страницу после успешного обновления
        window.location.reload();
        showToast('Кнопка обновлена успешно!');
      } else {
        // Обработка ошибок с выводом сообщения об ошибке
        const data = await response.json();
        alert("Error updating button: " + data.error);
      }
    } else {
      alert("Please provide valid name, link, and button text.");
    }
  } catch (error) {
    // Обработка ошибок с выводом сообщения об ошибке
    alert("Error updating button: " + error.message);
  }
}

async function deleteButton(id) {
  try {
    console.log("Deleting button with ID:", id);

    const token = getToken(); // Получаем токен

    const requestOptions = {
      method: "DELETE",
      headers: {
        Authorization: `${token}`,
      },
    };
    const response = await fetch(
      `http://localhost:3050/api/buttons/${id}`,
      requestOptions,
    );

    // Клонируем объект Response
    const clonedResponse = response.clone();

    // Прочитать тело ответа как JSON
    const data = await clonedResponse.json();

    if (clonedResponse.ok) {
      // Перезагрузить страницу после успешного обновления
      //window.location.reload();
      showToast('Кнопка удалена успешно!');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      // Обработка ошибок с выводом сообщения об ошибке
      alert("Error deleting button: " + data.error);
    }
  } catch (error) {
    // Обработка ошибок с выводом сообщения об ошибке
    alert("Error deleting button: " + error.message);
  }
}

async function getExistingButtons() {
  try {
    const token = getToken();

    const response = await fetch("http://localhost:3050/api/buttons", {
      headers: {
        Authorization: `${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buttonsData = await response.json();
    //console.log("Buttons data from server:", buttonsData);
    // Clear the table
    const buttonTable = document.getElementById("buttonTable");
    buttonTable.innerHTML = "";

    // Add each button to the table
    buttonsData.forEach(button => {
      const newRow = buttonTable.insertRow();
      const cell1 = newRow.insertCell(0);
      const cell2 = newRow.insertCell(1);
      const cell3 = newRow.insertCell(2);

      cell1.innerHTML = button.name;
      cell2.innerHTML = button.link;
      cell3.innerHTML = `
        <button onclick="editButton('${button.id}', '${button.name}', '${button.link}', '${button.buttonText}')">Edit</button>
        <button onclick="deleteButton('${button.id}')">Delete</button>
      `;
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

function getToken() {
  const storedToken = localStorage.getItem("token");
  if (storedToken && storedToken !== "undefined") {
    return JSON.parse(storedToken);
  }
  return null;
}

function logout() {
  localStorage.removeItem("token"); // Удаляем токен из Local Storage
  showToast('Выход выполнен успешно.');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
  // Опционально: Перенаправьте пользователя на страницу входа или выполните другие действия при выходе.
}

window.onload = function () {
  const token = getToken();

  // Если есть токен, пользователь авторизован
  if (token) {
    // Скрываем кнопку "Вход"
    document.getElementById("loginButton").style.display = "none";
    // Показываем кнопку "Выход"
    document.getElementById("logoutButton").style.display = "block";
    document.getElementById("createButton").style.display = "block";
    document.getElementById("tableContent").style.display = "block";
  } else {
    // Показываем кнопку "Вход"
    document.getElementById("loginButton").style.display = "block";
    // Скрываем кнопку "Выход"
    document.getElementById("logoutButton").style.display = "none";
  }

  getExistingButtons();
  //openModal();
};
