/**
 * 主入口模块
 * 应用初始化和通用组件
 */

/**
 * 模态框组件
 */
const Modal = {
  show({ title, body, onConfirm, confirmText = '确定', cancelText = '取消' }) {
    const modal = document.getElementById('modal');
    const titleEl = document.getElementById('modalTitle');
    const bodyEl = document.getElementById('modalBody');
    const footerEl = document.getElementById('modalFooter');
    const closeBtn = document.getElementById('modalClose');

    titleEl.textContent = title;
    bodyEl.innerHTML = body;
    footerEl.innerHTML = `
      <button class="btn btn-secondary modal-cancel">${cancelText}</button>
      <button class="btn btn-primary modal-confirm">${confirmText}</button>
    `;

    modal.classList.add('active');

    const close = () => {
      modal.classList.remove('active');
    };

    const confirm = () => {
      if (onConfirm) {
        onConfirm();
      }
      close();
    };

    closeBtn.onclick = close;
    footerEl.querySelector('.modal-cancel').onclick = close;
    footerEl.querySelector('.modal-confirm').onclick = confirm;

    const escHandler = (e) => {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    modal.onclick = (e) => {
      if (e.target === modal) {
        close();
      }
    };
  }
};

/**
 * Toast 通知组件
 */
const Toast = {
  show(message, type = 'info', duration = 3000) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  },

  success(message) {
    this.show(message, 'success');
  },

  error(message) {
    this.show(message, 'error');
  },

  info(message) {
    this.show(message, 'info');
  }
};

/**
 * 应用初始化
 */
document.addEventListener('DOMContentLoaded', () => {
  Navigation.init();
});

// 导出给全局使用
if (typeof window !== 'undefined') {
  window.Modal = Modal;
  window.Toast = Toast;
}