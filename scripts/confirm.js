const confirmModal = document.querySelector('#confirm');
const stayBtn = document.querySelector('#stay');
export const leaveBtn = document.querySelector('#leave');
let activeModal = null;


export function showConfirmModal() {
  activeModal = document.querySelector('.modal.active');
  confirmModal.classList.remove('hidden');
  activeModal.style.zIndex = '9';
}

export function hideConfirmModal() {
  confirmModal.classList.add('hidden');
  if (activeModal) {
    activeModal.style.zIndex = '10';
  }  
}

stayBtn.addEventListener('click', hideConfirmModal);