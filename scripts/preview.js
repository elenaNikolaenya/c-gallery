import { TOKEN } from "./constants.js";
import { BASE_URL } from "./constants.js";

import { overlay } from "./overlay.js";
import { showOverlay } from "./overlay.js";
import { hideOverlay } from "./overlay.js";

import { showConfirmModal } from "./confirm.js";
import { hideConfirmModal } from "./confirm.js";
import { leaveBtn } from "./confirm.js";

import { openModal } from "./upload.js";
import { closeModal } from "./upload.js";
import { renderMainContent } from "./upload.js";
import { displayIcons } from "./upload.js";

import { photoContent } from "./download.js";
import { getPosts } from "./download.js";

import { showAlert } from "./alerts.js";

import { getUser } from "./user.js";
import { myId } from "./user.js";

import { avatar } from "./avatar.js";

const previewPostModal = document.querySelector('.preview-post-modal');
const postTime = document.querySelector('.account-info__time');
export const deletePostBtn = document.querySelector('#delete-post');
const postPhoto = document.querySelector('#post-photo');
const postText = document.querySelector('.post-text');
const postHashtags = document.querySelector('.post-hashtags');
const postLikesCounter = document.querySelector('.statistics__likes');
const heart = postLikesCounter.querySelector('.fa-heart');
const postCommentsCounter = document.querySelector('.statistics__comments');
const commentsContent = document.querySelector('.comments__content');
const commentTemplate = document.querySelector('#comment-template');
const userAvatar = document.querySelector('.user-avatar img');
const commentInput = document.querySelector('#post-comment');
const sendCommentBtn = document.querySelector('.comments-button');

let user = {};
let posts = [];
let postId = null;
let likesNum = null;
let commentsNum = null;
let chosenPostOverlay = null;
let comments = null;


//render post's preview
photoContent.addEventListener('click', openPreviewPostModal);

async function openPreviewPostModal(event) {
  if (event.target.classList.contains('photos__content')) {
    return;
  }
  user = await getUser(avatar.id);
  displayIcons(user);
  await displayMyAvatar();
  posts = await getPosts(avatar.id);
  createPreviewPostModal(event, posts);
  deletePostBtn.addEventListener('click', deletePost);
  heart.addEventListener('click', likePost);
  openModal(previewPostModal);
  showOverlay();
  overlay.addEventListener('click', checkPreviewPostModalDetail); 
  leaveBtn.addEventListener('click', closePreviewPostModal);
}

function closePreviewPostModal() {
  hideConfirmModal();
  closeModal(previewPostModal);
  commentInput.value = '';
  hideOverlay();
  deletePostBtn.removeEventListener('click', deletePost);
  heart.removeEventListener('click', likePost); 
  overlay.removeEventListener('click', checkPreviewPostModalDetail);
  leaveBtn.removeEventListener('click', closePreviewPostModal);
}

function checkPreviewPostModalDetail() {
  if (commentInput.value) {
    showConfirmModal();
  } else {
    closePreviewPostModal();
  }
}

async function displayMyAvatar() {
  const me = await getUser(myId);
  userAvatar.src = me.photo;
}

function createPreviewPostModal(event, allPostsArr) {  
  if (event.target.classList.contains('overlay')) {
    chosenPostOverlay = event.target;
  } else {
    chosenPostOverlay = event.target.closest('div.overlay');
  }

  postId = +event.target.closest('div.post').id;  

  const postToDisplay = allPostsArr.find((item) => {
    return item.id === postId;
  });
 
  const {created_at, image, text, tags} = postToDisplay;
  likesNum = postToDisplay.likes;
  comments = postToDisplay.comments;
  commentsNum = comments.length;      
  postTime.textContent = getDayFromDate(created_at);
  postPhoto.src = image;
  postText.textContent = text;
  createHashtags(tags);
  displayLikesNumber();
  displayCommentsNumber();
  renderComments(comments);

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
  const now = new Date();
  const nowYear = now.getFullYear();
  const objDate = new Date(originalDate);
  const date = objDate.getDate();
  const month = objDate.getMonth();
  const year = objDate.getFullYear();
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  if (nowYear === year) {
    return `${date} ${months[month]}`;
  }
  return `${date} ${months[month]} ${year}`;  
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
  const urlPostsDelete = `${BASE_URL}posts/${postId}`;
  
  try {
    const response = await fetch(urlPostsDelete, {
      method: "DELETE",
      headers: {
        Authorization:
          `Bearer ${TOKEN}`,
      },
    });

    if (response.status === 204) {
      showAlert({success: true, mainTextInAlert: 'Пост удален', textInAlert: 'Данные успешно удалены'});
      renderMainContent();
    } else {      
      showAlert({success: false, mainTextInAlert: `Ошибка ${response.status}`, textInAlert: 'Не удалось удалить данные'});
    }   
  } catch (error) {
    showAlert({success: false, mainTextInAlert: `${error}`, textInAlert: 'Не удалось удалить данные'});
    
  } finally {
    closePreviewPostModal();
  }
}

//likes
async function likePost() {
  const urlLikePublish = `${BASE_URL}posts/${postId}/like/`;
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
      showAlert({success: false, mainTextInAlert: `Ошибка ${response.status}`, textInAlert: 'Не удалось поставить лайк :('});
    }      
  } catch (error) {      
    showAlert({success: false, mainTextInAlert: `${error}`, textInAlert: 'Oops! Не лайкнулось :('});
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
  
  const urlCommentPublish = `${BASE_URL}comments/`;
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
      showAlert({success: false, mainTextInAlert: `Ошибка ${response.status}`, textInAlert: 'Не удалось загрузить комментарии'});
    }      
  } catch (error) {    
    showAlert({success: false, mainTextInAlert: `${error}`, textInAlert: 'Не удалось загрузить комментарии'});
  } finally {
    clearInput();
  }
};

async function getComments() {
  const urlCommentsDownload = `${BASE_URL}users/${avatar.id}/posts/${postId}/comments/?` + new URLSearchParams({ limit: 50 }).toString();
  
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
      coms.sort((a,b) => a.id - b.id);
      return coms;
    } else {
      showAlert({success: false, mainTextInAlert: `Ошибка ${response.status}`, textInAlert: 'Не удалось получить комментарии'});
    }   
  } catch (error) {
    showAlert({success: false, mainTextInAlert: `${error}`, textInAlert: 'Не удалось получить комментарии'});
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
    const {id:comId, user:userObj, text, created_at} = item;
    let photo = null;
    let nickname = null;

    const commentedUserId = userObj.id;
    let commentedUser = {};
    await getCommentedUser(commentedUserId);

    //if we have actual info abour commented user - we use it, if don't - use info we got from comment
    if (commentedUser.photo) {
      photo = commentedUser.photo;
      nickname = commentedUser.nickname;       
    } else {
      photo = userObj.photo;
      nickname = userObj.nickname; 
    }
         
    const comment = makeCommentsByTemplate(photo, nickname, text, created_at, comId, commentedUserId);

    fragment.append(comment);

    async function getCommentedUser(id) {  
      const urlGetUser = `${BASE_URL}users/${id}/`;
    
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
          showAlert({success: false, mainTextInAlert: `Ошибка ${response.status}`, textInAlert: ''});
        }   
      } catch (error) {
        showAlert({success: false, mainTextInAlert: `Ошибка: ${error}`, textInAlert: ''});
      }      
    }
  }

  commentsContent.append(fragment);
}

function makeCommentsByTemplate(avatar, nickname,  commentText, date, id, commentedUserId) {
  const comment = commentTemplate.content.cloneNode(true);
  comment.querySelector('img').src = avatar;
  comment.querySelector('.comments__item-nickname').textContent = nickname;
  comment.querySelector('.comments__item-comment').textContent = commentText;
  comment.querySelector('.comments__item-time').textContent = getDayTimeFromDate(date);
  comment.querySelector('.comments__item').id = id; 
  if (+commentedUserId !== myId) {
    comment.querySelector('#delete-comment').classList.add('hidden');
  }  
  return comment; 
}

function getDayTimeFromDate(originalDate) {
  const objDate = new Date(originalDate);
  const hours = objDate.getHours();
  const minutes = objDate.getMinutes();
  return getDayFromDate(originalDate) + ` в ${hours}:${minutes}`;
}

//delete comments
commentsContent.addEventListener('click', deleteComment);

async function deleteComment(event) {
  if (event.target.id === 'delete-comment') {
    const commentToDelete = event.target.closest('.comments__item');
    const commentId = commentToDelete.id;
    const urlCommentsDelete = `${BASE_URL}users/${avatar.id}/posts/${postId}/comments/${commentId}`;

    try {
      const response = await fetch(urlCommentsDelete, {
        method: "DELETE",
        headers: {
          Authorization:
            `Bearer ${TOKEN}`,
        },
      });
  
      if (response.status === 204) {
        comments = await getComments();
        renderComments(comments);
        commentsNum -= 1;
        displayCommentsNumber();        
      } else {      
        showAlert({success: false, mainTextInAlert: `Ошибка ${response.status}`, textInAlert: 'Не удалось удалить комментарий'});
      }   
    } catch (error) {
      showAlert({success: false, mainTextInAlert: `${error}`, textInAlert: 'Не удалось удалить комментарий'});
    } 
  }
}