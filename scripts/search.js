import { TOKEN } from "./constants.js";
import { BASE_URL } from "./constants.js";

import { overlay } from "./overlay.js";
import { showOverlay } from "./overlay.js";
import { hideOverlay } from "./overlay.js";

import { openModal } from "./upload.js";
import { closeModal } from "./upload.js";

import { openUserProfile } from "./other-profile.js";

const searchBtn = document.querySelector('#search');
const searchUsersModal = document.querySelector('.search-users-modal');
const searchInput = document.querySelector('#find');
const searchResultsContent = document.querySelector('.search-users-modal__results');
const userTemplate = document.querySelector('#user-template');

let allUsers = [];


searchBtn.addEventListener('click', openSearchUsersModal);

async function openSearchUsersModal() {
  await fillResultsContent();  
  openModal(searchUsersModal);
  searchUsersModal.scrollTop = 0;
  showOverlay();
  overlay.addEventListener('click', closeSearchUsersModal);
}

function closeSearchUsersModal() {
  closeModal(searchUsersModal);
  searchInput.value = '';
  searchResultsContent.innerHTML = '';
  
  hideOverlay();
  overlay.removeEventListener('click', closeSearchUsersModal);
}

async function fillResultsContent() {
  await getUsers();
  displayUsers(allUsers);
}

async function getUsers() {
  const urlUsersDownload = `${BASE_URL}users/`;

  try {
    const response = await fetch(urlUsersDownload, {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${TOKEN}`,
      },
    });

    if (response.status === 200) {
      allUsers = await response.json();
    } else {
      showAlert({success: false, mainTextInAlert: `Ошибка ${response.status}`, textInAlert: 'Не удалось получить данные о пользователях'});
    }   
  } catch (error) {
    showAlert({success: false, mainTextInAlert: `${error}`, textInAlert: 'Не удалось получить данные о пользователях'});
  }  
}

function displayUsers(usersArray) {
  searchResultsContent.innerHTML = '';
  
  const fragment = new DocumentFragment();

  for (let item of usersArray) {
    const user = makeUserByTemplate(item.id, item.photo, item.nickname);
    fragment.append(user);
  }

  searchResultsContent.append(fragment);  
}

function makeUserByTemplate(id, photo, nickname) {
  const userItem = userTemplate.content.cloneNode(true);

  userItem.querySelector('.user-info').id = id;
  userItem.querySelector('img').src = photo;
  userItem.querySelector('span').textContent = nickname;  
  return userItem;
}

const debouncedFindUsers = _.debounce(findUsers, 700);
searchInput.addEventListener('input', debouncedFindUsers);

let matchUsers = [];

function findUsers() {
  const referenceStr = searchInput.value.trim().toLowerCase();
  matchUsers = findUsersByNickname(referenceStr);
  displayUsers(matchUsers);
}

function findUsersByNickname(searchStr) {
  const result = allUsers.filter((item) => {
    const nickname = item.nickname.toLowerCase();
    const email = item.email.toLowerCase();
    const name = item.name.toLowerCase();
    return nickname.includes(searchStr) || email.includes(searchStr) || name.includes(searchStr) ;
  })
  return result;
}
//visit a profile of another user
searchResultsContent.addEventListener('click', displayUserProfile);

function displayUserProfile(event) {
  closeSearchUsersModal();
  openUserProfile(event);
}