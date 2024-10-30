const bcrypt = require('bcrypt');

(async () => {
    const saltRounds = 10; // Или другое значение
    const newPassword = 'user'; // Новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log(hashedPassword);
})();
