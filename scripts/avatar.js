import { TOKEN } from "./constants.js";
import { BASE_URL } from "./constants.js";

import { showAlert } from "./alerts.js";

import { getUser } from "./user.js";
import { user } from "./user.js";

export const avatar = document.querySelector('#profile-avatar');
const avatarUploadInput = document.querySelector('#avatar-upload');


avatarUploadInput.addEventListener('change', submitAvatar);

async function submitAvatar() {
  const data = createFormData();
  const urlAvatarPublish = BASE_URL + "users/me/";

  try {
    const response = await fetch(urlAvatarPublish, {
      method: "PATCH",
      body: data,
      headers: {
        Authorization:
          `Bearer ${TOKEN} `,
      },
    });

    if (response.status === 200) {
      await getUser(); 
      displayAvatar();
    } else {                  
      showAlert(false, `Ошибка ${response.status}`, 'Не удалось загрузить фото');
    }      
  } catch (error) {    
    showAlert(false, `${error}`, 'Не удалось загрузить фото');
  } finally {
    avatarUploadInput.value = '';
  }
}

function createFormData() {
  let formData = new FormData();
  const file = avatarUploadInput.files[0];
  formData.append('photo', file);
  return formData;  
}

function displayAvatar() {
  avatar.src = user.photo;
  avatar.alt = user.nickname;
};