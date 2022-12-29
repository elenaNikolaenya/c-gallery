import { TIMEOUT } from "./constants.js";

const alertSuccess = document.querySelector('#alert-success');
const alertFail = document.querySelector('#alert-fail');


export function showAlert(success, mainTextInAlert, textInAlert) {
  let alertToShow = null;
  if (success) {
    alertToShow = alertSuccess;
  } else {
    alertToShow = alertFail;
  }
      
  alertToShow.querySelector('.alert__title').textContent = mainTextInAlert;
  alertToShow.querySelector('.alert__info').textContent = textInAlert;

  alertToShow.classList.remove('hidden');
  setTimeout(() => {
    alertToShow.classList.add('hidden');
  }, TIMEOUT);
}