document.addEventListener("DOMContentLoaded", function() {
    // Восстанавливаем активный таб из localStorage
    const activeTab = localStorage.getItem("activeTab");
    if (activeTab) {
        const tabToActivate = document.getElementById(activeTab);
        if (tabToActivate) {
            // Убираем класс 'active' у всех табов
            const allTabs = document.querySelectorAll('.nav-link');
            allTabs.forEach(tab => tab.classList.remove('active'));
            // Убираем класс 'show' и 'active' у всех контентов табов
            const allContents = document.querySelectorAll('.tab-pane');
            allContents.forEach(content => {
                content.classList.remove('show', 'active');
            });
            // Устанавливаем класс 'active' на выбранный таб
            tabToActivate.classList.add('active');
            // Показываем соответствующий контент
            const contentToShow = document.querySelector(tabToActivate.getAttribute('href'));
            contentToShow.classList.add('show', 'active');
        }
    }

    // Сохраняем активный таб при клике
    const tabs = document.querySelectorAll('.nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            localStorage.setItem("activeTab", this.id);
        });
    });
});
