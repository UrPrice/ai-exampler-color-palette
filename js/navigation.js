/**
 * navigation.js — Переключение между вьюхами приложения.
 * Зависимости: state.js, home.js, editor.js, sheet.js
 */

/** Имена вьюх и индексы кнопок навигации */
const VIEW_NAMES = ['home', 'editor', 'sheet'];

/**
 * Показывает нужную вьюху и скрывает остальные.
 * После переключения вызывает соответствующий render-метод.
 * @param {'home'|'editor'|'sheet'} name
 */
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');

  document.querySelectorAll('.nav-links button').forEach((btn, i) => {
    btn.classList.toggle('active', VIEW_NAMES[i] === name);
  });

  if (name === 'home')   renderHome();
  if (name === 'editor') renderEditor();
  if (name === 'sheet')  renderSheet();
}
