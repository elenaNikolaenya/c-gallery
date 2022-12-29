import { TOKEN } from "./constants.js";
import { BASE_URL } from "./constants.js";

import { overlay } from "./overlay.js";
import { showOverlay } from "./overlay.js";
import { hideOverlay } from "./overlay.js";

import { openModal } from "./upload.js";
import { closeModal } from "./upload.js";
import { disableBtn } from "./upload.js";
import { enableBtn } from "./upload.js";
import { countCharacters } from "./upload.js";
import { validateTextLength } from "./upload.js";
import { displayIcons } from "./upload.js";

import { fillBioData } from "./download.js";

import { showAlert } from "./alerts.js";

import { getUser } from "./user.js";
import { user } from "./user.js";

const editBioBtn = document.querySelector('#edit-bio');
const editBioModal = document.querySelector('.edit-bio-modal');
const accountInfo = document.querySelector('.account-info');
const nicknameInput = document.querySelector('#nickname');
const requiredNotification = document.querySelector('.required-field');
const nameInput = document.querySelector('#name');
const bioInput = document.querySelector('#bio');
const bioNotification = document.querySelector('#bio-notification');
const bioCounter = document.querySelector('.bio-count');
const bioSaveBtn = document.querySelector('#bio-save');
const bioDiscardBtn = document.querySelector('#bio-discard');
const MAX_CHAR_BIO = 150;


editBioBtn.addEventListener('click', openEditBioModal);

async function openEditBioModal() {
  displayIcons();
  fillEditBioModal();
  openModal(editBioModal);
  showOverlay();
  overlay.addEventListener('click', closeEditBioModal);
}

function closeEditBioModal() {
  closeModal(editBioModal);
  hideOverlay();
  overlay.removeEventListener('click', closeEditBioModal);
}

function fillEditBioModal() {  
  const {photo, nickname, name, biography} = user;
  const ava_photo = accountInfo.querySelector('img');
  ava_photo.src = photo;
  ava_photo.alt = nickname;
  accountInfo.querySelector('span').textContent = nickname;
  nicknameInput.value = nickname;
  nameInput.value = name;
  bioInput.value = biography;
  countCharacters(bioInput, bioCounter, MAX_CHAR_BIO);
}

nicknameInput.addEventListener('input', blockEmptyContent);

function blockEmptyContent() {
  if(!nicknameInput.value) {
    disableBtn(bioSaveBtn);
    requiredNotification.classList.remove('hidden');
  } else {
    enableBtn(bioSaveBtn);
    requiredNotification.classList.add('hidden');
  }  
}

bioInput.addEventListener('input', processBioData);

function processBioData() {
  countCharacters(bioInput, bioCounter, MAX_CHAR_BIO);  
  validateTextLength(bioInput, MAX_CHAR_BIO, bioCounter, bioNotification, bioSaveBtn);
}

bioSaveBtn.addEventListener('click', submitBioData);

async function submitBioData() {
  const data = createFormData2();
 
  const urlBioDataPublish = BASE_URL + "users/me/";

  try {
    const response = await fetch(urlBioDataPublish, {
      method: "PATCH",
      body: data,
      headers: {
        Authorization:
          `Bearer ${TOKEN} `,
      },
    });

    if (response.status === 200) {
      closeEditBioModal();
      showAlert(true, 'Информация обновлена!', 'Мы сохранили все данные');
      await getUser();
      fillBioData();      
    } else {                  
      showAlert(false, `Ошибка ${response.status}`, 'Не удалось загрузить данные');
    }      
  } catch (error) {    
    showAlert(false, `${error}`, 'Не удалось загрузить данные');
  }
}

function createFormData2() {
  let formData = new FormData();
  formData.append('nickname', `${nicknameInput.value}`);
  formData.append('name', `${nameInput.value}`);
  formData.append('biography', `${bioInput.value}`);
  return formData;  
}

bioDiscardBtn.addEventListener('click', fillEditBioModal);