/**
 * home.js — Главная страница: список шаблонов, создание, дублирование, открытие.
 * Зависимости: state.js, utils.js, storage.js, navigation.js, editor.js, sheet.js
 */

/**
 * Рендерит сетку карточек шаблонов.
 */
function renderHome() {
  const grid = document.getElementById('template-grid');
  grid.innerHTML = '';

  for (const [id, t] of Object.entries(AppState.templates)) {
    const sectionCount = t.rows.reduce(
      (s, r) => s + r.columns.reduce((s2, c) => s2 + c.sections.length, 0), 0
    );

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${esc(t.name || 'Без названия')}</h3>
      <p>${esc(t.subtitle || '')}<br>Секций: ${sectionCount} · Рядов: ${t.rows.length}</p>
      <div class="card-actions">
        <button class="btn btn-primary btn-sm"
          onclick="event.stopPropagation(); openSheet('${id}')">📝 Заполнить</button>
        <button class="btn btn-secondary btn-sm"
          onclick="event.stopPropagation(); openEditor('${id}')">✏️ Редактировать</button>
        <button class="btn btn-secondary btn-sm"
          onclick="event.stopPropagation(); duplicateTemplate('${id}')">📋 Копия</button>
      </div>`;
    grid.appendChild(card);
  }
}

/**
 * Создаёт новый пустой шаблон и открывает его в редакторе.
 */
function createNewTemplate() {
  const id = uid();
  AppState.templates[id] = {
    name: 'Новый шаблон',
    title: 'Заголовок',
    subtitle: 'Подзаголовок',
    rows: [{
      columns: [{
        flex: 1,
        sections: [{
          type: 'fields', title: 'Основная информация',
          columns: 2, align: '',
          fields: [{ label: 'Имя' }, { label: 'Класс' }]
        }]
      }]
    }]
  };
  saveToStorage();
  openEditor(id);
}

/**
 * Дублирует существующий шаблон.
 * @param {string} id
 */
function duplicateTemplate(id) {
  const newId = uid();
  const copy = JSON.parse(JSON.stringify(AppState.templates[id]));
  copy.name += ' (копия)';
  AppState.templates[newId] = copy;
  saveToStorage();
  renderHome();
  toast('Шаблон скопирован');
}

/**
 * Открывает редактор для указанного шаблона.
 * @param {string} id
 */
function openEditor(id) {
  AppState.currentTemplateId = id;
  AppState.editorSelection = { type: 'general' };
  showView('editor');
}

/**
 * Открывает лист персонажа для указанного шаблона.
 * @param {string} id
 */
function openSheet(id) {
  AppState.currentTemplateId = id;
  AppState.charData = {};
  showView('sheet');
}
