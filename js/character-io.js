/**
 * character-io.js — Импорт и экспорт данных персонажа и шаблонов.
 * Зависимости: state.js, utils.js, storage.js, navigation.js, editor.js
 */

/* ─────────────────── Персонаж ─────────────────── */

/**
 * Сохраняет текущие данные персонажа в JSON-файл.
 */
function saveCharacter() {
  collectSheetData();
  const tplName = AppState.templates[AppState.currentTemplateId]?.name || 'character';
  const payload = {
    _type:        'character',
    _templateId:  AppState.currentTemplateId,
    _templateName: tplName,
    fields:       AppState.charData,
  };
  downloadJSON(payload, tplName + '_data.json');
  toast('Персонаж сохранён');
}

/**
 * Загружает данные персонажа из JSON-файла.
 * Если файл содержит ссылку на известный шаблон — переключается на него.
 */
function importCharacter() {
  pickFile(file => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (data._type === 'character' && data.fields) {
          AppState.charData = data.fields;
          if (data._templateId && AppState.templates[data._templateId]) {
            AppState.currentTemplateId = data._templateId;
          }
          showView('sheet');
          toast('Персонаж загружен');
        } else {
          toast('Неверный формат файла персонажа');
        }
      } catch (err) {
        toast('Ошибка чтения файла');
      }
    };
    reader.readAsText(file);
  });
}

/* ─────────────────── Шаблон ─────────────────── */

/**
 * Импортирует шаблон из JSON-файла и открывает его в редакторе.
 */
function importTemplate() {
  pickFile(file => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.rows && Array.isArray(data.rows)) {
          const id = uid();
          AppState.templates[id] = data;
          saveToStorage();
          toast('Шаблон импортирован');
          openEditor(id);
        } else {
          toast('Неверный формат файла шаблона');
        }
      } catch (err) {
        toast('Ошибка чтения файла');
      }
    };
    reader.readAsText(file);
  });
}
