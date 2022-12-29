import { TOKEN } from "./constants.js";
import { BASE_URL } from "./constants.js";

import { showAlert } from "./alerts.js";

export let user = [];


try {
  user = JSON.parse(localStorage.getItem('currentUser') || '[]');
} catch (error) {
  console.log(error);
}

if (!user.length) {
  await getUser();
}

export async function getUser() {  
  const urlUserDownload = BASE_URL + "users/me/";

  try {
    const response = await fetch(urlUserDownload, {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${TOKEN}`,
      },
    });

    if (response.status === 200) {
      user = await response.json();
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      showAlert(false, `Ошибка ${response.status}`, 'Не удалось получить данные о пользователе');
    }   
  } catch (error) {
    showAlert(false, `${error}`, 'Не удалось получить данные о пользователе');
  }
}