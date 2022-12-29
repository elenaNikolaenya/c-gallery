import { TOKEN } from "./constants.js";
import { BASE_URL } from "./constants.js";

import { overlay } from "./overlay.js";
import { showOverlay } from "./overlay.js";
import { hideOverlay } from "./overlay.js";

import { openModal } from "./upload.js";
import { closeModal } from "./upload.js";
import { renderMainContent } from "./upload.js";

import { photoContent } from "./download.js";
import { posts } from "./download.js";

import { showAlert } from "./alerts.js";

const previewPostModal = document.querySelector('.preview-post-modal');
const postTime = document.querySelector('.account-info__time');
const deletePostBtn = document.querySelector('#delete-post');
const postPhoto = document.querySelector('#post-photo');
const postText = document.querySelector('.post-text');
const postHashtags = document.querySelector('.post-hashtags');
const postLikesCounter = document.querySelector('.statistics__likes');
const heart = postLikesCounter.querySelector('.fa-heart');
const postCommentsCounter = document.querySelector('.statistics__comments');
const commentsContent = document.querySelector('.comments__content');
const commentTemplate = document.querySelector('#comment-template');
const commentInput = document.querySelector('#post-comment');
const sendCommentBtn = document.querySelector('.comments-button');


//render post's preview
photoContent.addEventListener('click', openPreviewPostModal);

function openPreviewPostModal() {
  createPreviewPostModal(event, posts);
  deletePostBtn.addEventListener('click', deletePost);
  heart.addEventListener('click', likePost);
  openModal(previewPostModal);
  showOverlay();
  overlay.addEventListener('click', closePreviewPostModal); 
}

function closePreviewPostModal() {
  closeModal(previewPostModal);
  hideOverlay();
  deletePostBtn.removeEventListener('click', deletePost);
  heart.removeEventListener('click', likePost); 
}

let postId = null;
let likesNum = null;
let commentsNum = null;
let chosenPostOverlay = null;
let comments = null;

function createPreviewPostModal(event, allPostsArr) {
  postId = +event.target.closest('div.post').id;
  chosenPostOverlay = event.target;

  allPostsArr.forEach((item) => {
    if (item.id === postId) {
      const {created_at, image, text, tags} = item;
      likesNum = item.likes;
      comments = item.comments;
      commentsNum = comments.length;      
      postTime.textContent = getDayFromDate(created_at);
      postPhoto.src = image;
      postText.textContent = text;
      createHashtags(tags);
      displayLikesNumber();
      displayCommentsNumber();
      renderComments(comments);
    }
  });

  function createHashtags(arr) {
    postHashtags.innerHTML = '';
    const fragment = new DocumentFragment();

    arr.forEach((item) => {
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = item;
      fragment.append(link);
    })

    postHashtags.append(fragment);
  }   
}

function getDayFromDate(originalDate) {
  const objDate = new Date(originalDate);
  const date = objDate.getDate();
  const month = objDate.getMonth();
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${date} ${months[month]}`;
}

function displayLikesNumber() {
  postLikesCounter.querySelector('span').textContent = likesNum;
  chosenPostOverlay.querySelector('.likes span').textContent = likesNum;
}

function displayCommentsNumber() {
  postCommentsCounter.querySelector('span').textContent = commentsNum;
  chosenPostOverlay.querySelector('.comments span').textContent = commentsNum;
}

//delete post
async function deletePost() {
  const urlPostsDelete = BASE_URL + "posts/" + `${postId}`;
  
  try {
    const response = await fetch(urlPostsDelete, {
      method: "DELETE",
      headers: {
        Authorization:
          `Bearer ${TOKEN}`,
      },
    });

    if (response.status === 204) {
      showAlert(true, 'Пост удален', 'Данные успешно удалены');
      renderMainContent();
    } else {      
      showAlert(false, `Ошибка ${response.status}`, 'Не удалось удалить данные');
    }   
  } catch (error) {
    showAlert(false, `${error}`, 'Не удалось удалить данные');
    
  } finally {
    closePreviewPostModal();
  }
}

//likes
async function likePost() {
  const urlLikePublish = BASE_URL + `posts/${postId}/like/`;
  try {
    const response = await fetch(urlLikePublish, {
      method: "POST",
      body: `${postId}`,
      headers: {
        Authorization:
          `Bearer ${TOKEN} `,
      },
    });
  
    if (response.ok) { //response.status === 201  have to work but didn't
      postLikesCounter.classList.add('liked');
      likesNum += 1;
      displayLikesNumber();
    } else {             
      showAlert(false, `Ошибка ${response.status}`, 'Не удалось поставить лайк :(');
    }      
  } catch (error) {      
    showAlert(false, `${error}`, 'Oops! Не лайкнулось :(');
  }  
}

//comments
//send a comment
commentInput.addEventListener('keydown', sendCommendByEnter);
sendCommentBtn.addEventListener('click', sendComment);

function sendCommendByEnter(event) {
  if (event.key === 'Enter') {
    sendComment();
  }
}

async function sendComment() {
  if (!commentInput.value) {
    return;
  }
  
  const urlCommentPublish = BASE_URL + "comments/";
  const data = JSON.stringify({
    "text": commentInput.value,
    "post": postId
  });

  try {
    const response = await fetch(urlCommentPublish, {
      method: "POST",
      body: data,
      headers: {
        Authorization:
          `Bearer ${TOKEN} `,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 201) {
      comments = await getComments();
      renderComments(comments);
      commentsNum += 1;
      displayCommentsNumber();
    } else {                  
      showAlert(false, `Ошибка ${response.status}`, 'Не удалось загрузить комментарии');
    }      
  } catch (error) {    
    showAlert(false, `${error}`, 'Не удалось загрузить комментарии');
  } finally {
    clearInput();
  }
};

async function getComments() {
  const urlCommentsDownload = BASE_URL + `users/me/posts/${postId}/comments/?` + new URLSearchParams({ limit: 50 }).toString();
  
  try {
    const response = await fetch(urlCommentsDownload, {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${TOKEN}`,
      },
    });

    if (response.status === 200) {
      let coms = await response.json();
      coms = coms.sort((a,b) => a.id - b.id);
      return coms;
    } else {
      showAlert(false, `Ошибка ${response.status}`, 'Не удалось получить комментарии');
    }   
  } catch (error) {
    showAlert(false, `${error}`, 'Не удалось получить комментарии');
  }  
}

function clearInput() {
  commentInput.value ='';
}

//render comments
async function renderComments(postComments) {
  commentsContent.innerHTML = '';

  const fragment = new DocumentFragment();

  for (let item of postComments) {
    const {user:userObj, text, created_at} = item;
    let photo = null;
    let nickname = null;

    const userId = userObj.id;
    let commentedUser = {};
    await getCommentedUser(userId);

    if (commentedUser.photo) {
      photo = commentedUser.photo;
      nickname = commentedUser.nickname;       
    } else {
      photo = userObj.photo;
      nickname = userObj.nickname; 
    }
         
    const comment = makeCommentsByTemplate(photo, nickname, text, created_at);

    fragment.append(comment);

    async function getCommentedUser(id) {  
      const urlGetUser = BASE_URL + `users/${id}/`;
    
      try {
        const response = await fetch(urlGetUser, {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${TOKEN}`,
          },
        });
    
        if (response.status === 200) {
          commentedUser = await response.json();          
        } else {
          console.log(`Ошибка ${response.status}`); // I don't want to show any messages to user, can I use conssole.log here?
        }   
      } catch (error) {
        console.log(error);
      }      
    }
  }

  commentsContent.append(fragment);
}

function makeCommentsByTemplate(avatar, nickname,  commentText, date) {
  const comment = commentTemplate.content.cloneNode(true);
  comment.querySelector('img').src = avatar;
  comment.querySelector('.comments__item-nickname').textContent = nickname;
  comment.querySelector('.comments__item-comment').textContent = commentText;
  comment.querySelector('.comments__item-time').textContent = getDayTimeFromDate(date); 
  return comment; 
}

function getDayTimeFromDate(originalDate) {
  const objDate = new Date(originalDate);
  const hours = objDate.getHours();
  const minutes = objDate.getMinutes();
  return getDayFromDate(originalDate) + ` в ${hours}:${minutes}`;
}