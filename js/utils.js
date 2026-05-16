/**
 * utils.js — Вспомогательные функции общего назначения
 */

/**
 * Экранирует HTML-спецсимволы в строке.
 * @param {string} s
 * @returns {string}
 */
function esc(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/**
 * Генерирует уникальный идентификатор шаблона.
 * @returns {string}
 */
function uid() {
  return 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

/**
 * Скачивает объект в виде JSON-файла.
 * @param {Object} data
 * @param {string} filename
 */
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Открывает диалог выбора файла и передаёт выбранный файл в колбэк.
 * @param {function(File): void} cb
 */
function pickFile(cb) {
  const input = document.getElementById('file-input');
  input.value = '';
  input.onchange = () => { if (input.files[0]) cb(input.files[0]); };
  input.click();
}

/**
 * Показывает всплывающее уведомление (toast) с сообщением.
 * @param {string} msg
 */
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('show'), 2500);
}
