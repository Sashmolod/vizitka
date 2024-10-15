const serverAddress = "http://localhost:3050";

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
        const response = await fetch(`${serverAddress}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, password}),
        });

        if (response.ok) {
            // Authentication successful
            // Находим соответствующий инпут (предположим, у него есть ID "username")
            const usernameInput = document.getElementById("username");
            const passwordInput = document.getElementById("password");
            // Добавляем класс "is-invalid" к инпуту
            usernameInput.classList.add("is-valid");
            passwordInput.classList.add("is-valid");
            // Удаляем класс "is-valid", если он есть
            usernameInput.classList.remove("is-invalid");
            passwordInput.classList.remove("is-invalid");
            const data = await response.json();
            const token = data.token;
            localStorage.setItem("token", JSON.stringify(token));

            // Показываем сообщение об успешной аутентификации
            alert("Авторизация успешна!");
            // Скрываем кнопку "Вход"
            document.getElementById("loginButton").style.display = "none";
            // Показываем кнопку "Выход"
            document.getElementById("logoutButton").style.display = "block";

            document.getElementById("content").style.display = "block";
            window.location.reload();
        } else {
            const data = await response.json();
            if (data.error) {
                // Находим соответствующий инпут (предположим, у него есть ID "username")
                const usernameInput = document.getElementById("username");
                const passwordInput = document.getElementById("password");
                // Добавляем класс "is-invalid" к инпуту
                usernameInput.classList.add("is-invalid");
                passwordInput.classList.add("is-invalid");
                // Удаляем класс "is-valid", если он есть
                usernameInput.classList.remove("is-valid");
                passwordInput.classList.remove("is-valid");
                // Отображаем сообщение об ошибке (можно использовать alert, но лучше показать сообщение пользователю в интерфейсе)
                const errorMessage = data.error; // Предполагается, что сервер вернул текст ошибки
                alert("Authentication failed: " + errorMessage);
            }
        }
    } catch (error) {
        console.error("Error during authentication:", error);
    }
}

function isValidInput(input) {
    return input !== null && input.trim() !== "";
}

function openCreateModal() {
    const createModal = document.getElementById("createModal");
    createModal.style.display = "block";
}

function closeCreateModal() {
    const createModal = document.getElementById("createModal");
    createModal.style.display = "none";
}

function clearCreateForm() {
    document.getElementById("createName").value = "";
    document.getElementById("createLink").value = "";
    document.getElementById("createButtonText").value = "";
}

async function createButton() {
    const name = document.getElementById("createName").value;
    const link = document.getElementById("createLink").value;
    const buttonText = document.getElementById("createButtonText").value;

    try {
        if (name && link && buttonText) {
            const newButton = {name, link, buttonText};
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
                `${serverAddress}/api/buttons`,
                requestOptions,
            );

            if (response.ok) {
                // Закроем модальное окно создания
                closeCreateModal();

                // Обновим список кнопок после успешного создания
                getExistingButtons();

                alert("Button created successfully.");
            } else {
                const data = await response.json();
                alert("Error creating button: " + data.error);
            }
        } else {
            alert("Please provide valid name, link, and button text.");
        }
    } catch (error) {
        alert("Error creating button: " + error.message);
    }
}

function updateButtonTable(id, name, link, buttonText) {
    const buttonTable = document.getElementById("buttonTable");
    const newRow = buttonTable.insertRow();
    newRow.setAttribute("data-id", id);
    const cell0 = newRow.insertCell(0); // Добавлен этот блок для вывода id
    const cell1 = newRow.insertCell(1);
    const cell2 = newRow.insertCell(2);
    const cell3 = newRow.insertCell(3);
    const cell4 = newRow.insertCell(4); // Добавлен этот блок для вывода id

    cell0.innerHTML = id; // Добавлен этот блок для вывода id
    cell1.innerHTML = name;
    cell2.innerHTML = link;
    cell3.innerHTML = buttonText;
    cell4.innerHTML = `
  <button onclick="editButton('${id}', '${name}', '${link}', '${buttonText}')" class="btn btn-outline-primary icon-button">
  <i class="fas fa-edit"></i>
</button>

<button onclick="deleteButton('${id}')" class="btn btn-outline-danger icon-button">
  <i class="fas fa-trash-alt"></i>
</button>

  `;
}

function clearEditForm() {
    document.getElementById("editName").value = "";
    document.getElementById("editLink").value = "";
    document.getElementById("editButtonText").value = "";
}

let editedButtonId; // Переменная для хранения ID редактируемой кнопки

function editButton(buttonId, name, link, buttonText) {
    // Заполним поля формы редактирования данными кнопки
    document.getElementById("editName").value = name;
    document.getElementById("editLink").value = link;
    document.getElementById("editButtonText").value = buttonText;

    // Сохраним ID редактируемой кнопки
    editedButtonId = buttonId;

    // Откроем модальное окно редактирования
    const editModal = document.getElementById("editModal");
    editModal.style.display = "block";
}

function closeEditModal() {
    const editModal = document.getElementById("editModal");
    editModal.style.display = "none";
}

async function saveButtonChanges() {
    const newName = document.getElementById("editName").value;
    const newLink = document.getElementById("editLink").value;
    const newButtonText = document.getElementById("editButtonText").value;

    try {
        if (newName && newLink && newButtonText) {
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
                `${serverAddress}/api/buttons/${editedButtonId}`,
                requestOptions,
            );

            if (response.ok) {
                // Закроем модальное окно редактирования
                closeEditModal();

                // Обновим список кнопок после успешного обновления
                getExistingButtons();

                alert("Button updated successfully.");
            } else {
                const data = await response.json();
                alert("Error updating button: " + data.error);
            }
        } else {
            alert("Please provide valid name, link, and button text.");
        }
    } catch (error) {
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
            `${serverAddress}/api/buttons/${id}`,
            requestOptions,
        );

        // Клонируем объект Response
        const clonedResponse = response.clone();

        // Прочитать тело ответа как JSON
        const data = await clonedResponse.json();

        if (clonedResponse.ok) {
            // Перезагрузить страницу после успешного обновления
            window.location.reload();
            alert("Button deleted successfully.");
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

        const response = await fetch(`${serverAddress}/api/buttons`, {
            headers: {
                Authorization: `${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const buttonsData = await response.json();
        console.log("Buttons data from server:", buttonsData);
        // Clear the table
        const buttonTable = document.getElementById("buttonTable");
        buttonTable.innerHTML = "";

        // Add each button to the table
        buttonsData.forEach(button => {
            const newRow = buttonTable.insertRow();
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);
            const cell4 = newRow.insertCell(3);

            cell1.innerHTML = button.name;
            cell2.innerHTML = button.link;
            cell3.innerHTML = button.buttonText;
            cell4.innerHTML = `
      <button onclick="editButton('${button.id}', '${button.name}', '${button.link}', '${button.buttonText}')" class="btn btn-outline-primary icon-button">
      <i class="fas fa-edit"></i>
    </button>
    
    <button onclick="deleteButton('${button.id}')" class="btn btn-outline-danger icon-button">
      <i class="fas fa-trash-alt"></i>
    </button>
    
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
    alert("Выход выполнен успешно.");
    window.location.reload();
    window.location.href = "../index.html";
}

window.onload = function () {
    const token = getToken();

    // Если есть токен, пользователь авторизован
    if (token) {
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("logoutButton").style.display = "block";
        document.getElementById("content").style.display = "block";
    } else {
        document.getElementById("content").style.display = "none";

    }
    getExistingButtons();
};
