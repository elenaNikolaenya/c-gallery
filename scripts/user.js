import { TOKEN } from "./constants.js";
import { BASE_URL } from "./constants.js";

import { showAlert } from "./alerts.js";


async function getMe() {  
  const urlMeDownload = `${BASE_URL}users/me/`;

  try {
    const response = await fetch(urlMeDownload, {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${TOKEN}`,
      },
    });

    if (response.status === 200) {
      const me = await response.json();
      return me;     
    } else {
      showAlert({success: false, mainTextInAlert: `Ошибка ${response.status}`, textInAlert: 'Не удалось получить данные о пользователе'});
    }   
  } catch (error) {
    showAlert({success: false, mainTextInAlert: `${error}`, textInAlert: 'Не удалось получить данные о пользователе'});
  }
}

const me = await getMe()
export const myId = me.id;

export async function getUser(id) {  
  const urlUserDownload = `${BASE_URL}users/${id}/`;

  try {
    const response = await fetch(urlUserDownload, {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${TOKEN}`,
      },
    });

    if (response.status === 200) {
      const user = await response.json();
      return user;     
    } else {
      showAlert({success: false, mainTextInAlert: `Ошибка ${response.status}`, textInAlert: 'Не удалось получить данные о пользователе'});
    }   
  } catch (error) {
    showAlert({success: false, mainTextInAlert: `${error}`, textInAlert: 'Не удалось получить данные о пользователе'});
  }
}