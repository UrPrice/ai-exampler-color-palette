/**
 * storage.js — Работа с localStorage: загрузка и сохранение шаблонов.
 * Зависимости: state.js, utils.js, data/default-template.json (встроен как константа)
 */

/** Ключ хранилища */
const STORAGE_KEY = 'cs_templates';

/**
 * Загружает шаблоны из localStorage.
 * Если хранилище пустое — создаёт шаблон по умолчанию.
 */
async function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      AppState.templates = JSON.parse(raw);
    }
  } catch (e) {
    AppState.templates = {};
  }

  if (!Object.keys(AppState.templates).length) {
    await loadDefaultTemplate();
  }
}

/**
 * Загружает шаблон по умолчанию из data/default-template.json.
 * Если fetch недоступен (file://) — использует встроенную копию.
 */
async function loadDefaultTemplate() {
  let defaultTpl = null;

  try {
    const res = await fetch('./data/default-template.json');
    if (res.ok) defaultTpl = await res.json();
  } catch (_) {
    // fetch не сработал (file://), используем встроенную копию
  }

  if (!defaultTpl) {
    defaultTpl = getFallbackTemplate();
  }

  const id = uid();
  AppState.templates[id] = JSON.parse(JSON.stringify(defaultTpl));
  saveToStorage();
}

/**
 * Сохраняет текущие шаблоны в localStorage.
 */
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.templates));
}

/**
 * Встроенная резервная копия шаблона по умолчанию
 * (на случай если fetch недоступен или файл не найден).
 * @returns {Object}
 */
function getFallbackTemplate() {
  return {
    name: 'Орден Серых Стражей',
    title: 'Орден Серых Стражей',
    subtitle: 'ЭДЭМЭ | 1433 ГОД | КУЛЬТ СВЕТА',
    rows: [
      {
        columns: [{
          flex: 1,
          sections: [{
            type: 'fields', title: 'Основная информация', columns: 2, align: '',
            fields: [{ label: 'Имя' }, { label: 'Ранг' }, { label: 'Прозвище' }, { label: 'Уровень' }]
          }]
        }]
      },
      {
        columns: [
          {
            flex: 1,
            sections: [
              {
                type: 'fields', title: 'Характеристики', columns: 1, align: 'center',
                fields: [{ label: 'Самочувствие' }, { label: 'Движение' }, { label: 'Мышление' },
                         { label: 'Внимание' }, { label: 'Сражение' }, { label: 'Общение' }]
              },
              {
                type: 'fields', title: 'Ресурсы', columns: 1, align: 'center',
                fields: [{ label: 'Здоровье' }, { label: 'Вдохновенье' }, { label: 'Опыт' }]
              }
            ]
          },
          {
            flex: 1.5,
            sections: [{
              type: 'table', title: 'Черты и способности',
              headers: ['Название', 'Описание'], widths: ['35%', '65%'], rows: 10
            }]
          }
        ]
      },
      {
        columns: [{
          flex: 1,
          sections: [{
            type: 'table', title: 'Инвентарь и Арсенал',
            headers: ['Предмет', 'Особенности'], widths: ['40%', '60%'], rows: 6
          }]
        }]
      },
      {
        columns: [
          { flex: 1, sections: [{ type: 'textarea', title: 'Биография', height: 200 }] },
          { flex: 1, sections: [{ type: 'textarea', title: 'Заметки', height: 200 }] }
        ]
      }
    ]
  };
}
