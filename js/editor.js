/**
 * editor.js — Редактор шаблонов листов персонажей.
 * Зависимости: state.js, utils.js, storage.js, navigation.js
 */

/* ─────────────────── Хелперы доступа к данным ─────────────────── */

/** @returns {Object} Текущий шаблон */
function tpl() {
  return AppState.templates[AppState.currentTemplateId];
}

/**
 * Возвращает секцию по координатам.
 * @param {number} ri rowIndex
 * @param {number} ci columnIndex
 * @param {number} si sectionIndex
 * @returns {Object}
 */
function getSection(ri, ci, si) {
  return tpl().rows[ri].columns[ci].sections[si];
}

/* ─────────────────── Точка входа ─────────────────── */

/**
 * Инициализирует и перерисовывает весь редактор.
 */
function renderEditor() {
  if (!AppState.currentTemplateId || !tpl()) {
    showView('home');
    return;
  }
  renderTree();
  renderEditorForm();
}

/* ─────────────────── Дерево структуры ─────────────────── */

/**
 * Строит дерево секций в левой панели редактора.
 */
function renderTree() {
  const container = document.getElementById('tree-container');
  const t = tpl();
  const sel = AppState.editorSelection;

  let h = `<div class="tree-item ${sel?.type === 'general' ? 'active' : ''}"
    onclick="selectEditor('general')"><span class="icon">📄</span> ${esc(t.name)}</div>`;

  t.rows.forEach((row, ri) => {
    h += `<div class="tree-row">Ряд ${ri + 1}
      <span style="float:right;cursor:pointer;font-size:14px"
        onclick="event.stopPropagation();removeRow(${ri})">✕</span></div>`;

    row.columns.forEach((col, ci) => {
      col.sections.forEach((sec, si) => {
        const active = sel?.type === 'section' &&
          sel.rowIdx === ri && sel.colIdx === ci && sel.secIdx === si;
        const icon = sec.type === 'fields' ? '📋' : sec.type === 'table' ? '📊' : '📝';
        h += `<div class="tree-item tree-section ${active ? 'active' : ''}"
          onclick="selectEditor('section',${ri},${ci},${si})">
          <span class="icon">${icon}</span> ${esc(sec.title)}</div>`;
      });
      h += `<div class="tree-add" onclick="addSection(${ri},${ci})">＋ секцию</div>`;
    });

    h += `<div class="tree-add" style="margin-left:12px"
      onclick="addColumn(${ri})">＋ колонку</div>`;
  });

  container.innerHTML = h;
}

/* ─────────────────── Выбор узла ─────────────────── */

/**
 * Устанавливает выбранный узел и перерисовывает редактор.
 */
function selectEditor(type, ri, ci, si) {
  AppState.editorSelection = { type, rowIdx: ri, colIdx: ci, secIdx: si };
  renderTree();
  renderEditorForm();
}

/* ─────────────────── Форма редактирования ─────────────────── */

/**
 * Рендерит форму редактирования выбранного узла.
 */
function renderEditorForm() {
  const container = document.getElementById('editor-form-container');
  const t = tpl();
  const sel = AppState.editorSelection;

  /* — Общие настройки — */
  if (!sel || sel.type === 'general') {
    container.innerHTML = `
      <div class="editor-form">
        <h3>Общие настройки</h3>
        <div class="form-group">
          <label>Название шаблона</label>
          <input class="form-input" value="${esc(t.name)}"
            oninput="tpl().name=this.value;renderTree()">
        </div>
        <div class="form-group">
          <label>Заголовок на листе</label>
          <input class="form-input" value="${esc(t.title)}"
            oninput="tpl().title=this.value">
        </div>
        <div class="form-group">
          <label>Подзаголовок</label>
          <input class="form-input" value="${esc(t.subtitle)}"
            oninput="tpl().subtitle=this.value">
        </div>
      </div>`;
    return;
  }

  /* — Редактирование секции — */
  if (sel.type === 'section') {
    const { rowIdx: ri, colIdx: ci, secIdx: si } = sel;
    const sec = t.rows[ri]?.columns[ci]?.sections[si];
    const col = t.rows[ri]?.columns[ci];

    if (!sec) { selectEditor('general'); return; }

    let h = `<div class="editor-form">
      <h3>Секция: ${esc(sec.title)}</h3>
      <div style="display:flex;gap:12px;margin-bottom:16px">
        <div class="form-group" style="flex:2">
          <label>Название</label>
          <input class="form-input" value="${esc(sec.title)}"
            oninput="getSection(${ri},${ci},${si}).title=this.value;renderTree()">
        </div>
        <div class="form-group" style="flex:1">
          <label>Тип</label>
          <select class="form-input" onchange="changeSectionType(${ri},${ci},${si},this.value)">
            <option value="fields"   ${sec.type === 'fields'   ? 'selected' : ''}>Поля</option>
            <option value="table"    ${sec.type === 'table'    ? 'selected' : ''}>Таблица</option>
            <option value="textarea" ${sec.type === 'textarea' ? 'selected' : ''}>Текстовое поле</option>
          </select>
        </div>
        <div class="form-group" style="flex:0.7">
          <label>Flex колонки</label>
          <input class="form-input" type="number" step="0.1" min="0.1" value="${col.flex}"
            oninput="tpl().rows[${ri}].columns[${ci}].flex=parseFloat(this.value)||1">
        </div>
      </div>`;

    /* — Поля — */
    if (sec.type === 'fields') {
      h += `
        <div class="form-group">
          <label>Кол-во колонок</label>
          <select class="form-input" style="width:80px"
            onchange="getSection(${ri},${ci},${si}).columns=parseInt(this.value)">
            <option value="1" ${sec.columns === 1 ? 'selected' : ''}>1</option>
            <option value="2" ${sec.columns === 2 ? 'selected' : ''}>2</option>
            <option value="3" ${sec.columns === 3 ? 'selected' : ''}>3</option>
          </select>
        </div>
        <div class="form-group">
          <label>Выравнивание значений</label>
          <select class="form-input" style="width:120px"
            onchange="getSection(${ri},${ci},${si}).align=this.value">
            <option value=""       ${!sec.align          ? 'selected' : ''}>По левому краю</option>
            <option value="center" ${sec.align==='center'? 'selected' : ''}>По центру</option>
          </select>
        </div>
        <div class="form-group">
          <label>Поля</label>
          <div class="field-list" id="field-list">`;
      (sec.fields || []).forEach((f, fi) => {
        h += `<div class="field-item">
          <input class="form-input" value="${esc(f.label)}"
            oninput="getSection(${ri},${ci},${si}).fields[${fi}].label=this.value"
            placeholder="Название поля">
          <button class="btn btn-danger btn-sm"
            onclick="removeField(${ri},${ci},${si},${fi})">✕</button>
        </div>`;
      });
      h += `</div>
          <button class="btn btn-secondary btn-sm" style="margin-top:8px"
            onclick="addField(${ri},${ci},${si})">＋ Добавить поле</button>
        </div>`;
    }

    /* — Таблица — */
    if (sec.type === 'table') {
      h += `
        <div class="form-group">
          <label>Строк</label>
          <input class="form-input" type="number" min="1" max="30" style="width:80px"
            value="${sec.rows || 5}"
            oninput="getSection(${ri},${ci},${si}).rows=parseInt(this.value)||5">
        </div>
        <div class="form-group">
          <label>Заголовки таблицы</label>
          <div id="header-list">`;
      (sec.headers || []).forEach((hd, hi) => {
        h += `<div class="header-item">
          <input class="form-input" value="${esc(hd)}"
            oninput="getSection(${ri},${ci},${si}).headers[${hi}]=this.value"
            placeholder="Заголовок">
          <input class="form-input" value="${esc((sec.widths || [])[hi] || '')}"
            oninput="ensureWidths(${ri},${ci},${si});getSection(${ri},${ci},${si}).widths[${hi}]=this.value"
            placeholder="Ширина (напр. 40%)">
          <button class="btn btn-danger btn-sm"
            onclick="removeHeader(${ri},${ci},${si},${hi})">✕</button>
        </div>`;
      });
      h += `</div>
          <button class="btn btn-secondary btn-sm" style="margin-top:8px"
            onclick="addHeader(${ri},${ci},${si})">＋ Столбец</button>
        </div>`;
    }

    /* — Textarea — */
    if (sec.type === 'textarea') {
      h += `
        <div class="form-group">
          <label>Мин. высота (px)</label>
          <input class="form-input" type="number" min="50" max="600" style="width:120px"
            value="${sec.height || 200}"
            oninput="getSection(${ri},${ci},${si}).height=parseInt(this.value)||200">
        </div>`;
    }

    /* — Кнопки управления секцией — */
    const hasMultipleColumns = t.rows[ri].columns.length > 1;
    h += `
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #2a2a2e;display:flex;gap:8px">
        <button class="btn btn-secondary btn-sm"
          onclick="moveSection(${ri},${ci},${si},-1)">↑ Вверх</button>
        <button class="btn btn-secondary btn-sm"
          onclick="moveSection(${ri},${ci},${si},1)">↓ Вниз</button>
        <div style="flex:1"></div>
        <button class="btn btn-danger btn-sm"
          onclick="removeSection(${ri},${ci},${si})">🗑 Удалить секцию</button>
        ${hasMultipleColumns
          ? `<button class="btn btn-danger btn-sm"
               onclick="removeColumn(${ri},${ci})">🗑 Удалить колонку</button>`
          : ''}
      </div>
    </div>`;

    container.innerHTML = h;
  }
}

/* ─────────────────── Поля ─────────────────── */

function addField(ri, ci, si) {
  getSection(ri, ci, si).fields.push({ label: 'Новое поле' });
  renderEditorForm();
}

function removeField(ri, ci, si, fi) {
  getSection(ri, ci, si).fields.splice(fi, 1);
  renderEditorForm();
}

/* ─────────────────── Заголовки таблицы ─────────────────── */

function addHeader(ri, ci, si) {
  const s = getSection(ri, ci, si);
  s.headers.push('Столбец');
  if (!s.widths) s.widths = [];
  s.widths.push('');
  renderEditorForm();
}

function removeHeader(ri, ci, si, hi) {
  const s = getSection(ri, ci, si);
  s.headers.splice(hi, 1);
  if (s.widths) s.widths.splice(hi, 1);
  renderEditorForm();
}

function ensureWidths(ri, ci, si) {
  const s = getSection(ri, ci, si);
  if (!s.widths) s.widths = s.headers.map(() => '');
  while (s.widths.length < s.headers.length) s.widths.push('');
}

/* ─────────────────── Смена типа секции ─────────────────── */

function changeSectionType(ri, ci, si, newType) {
  const sec = getSection(ri, ci, si);
  const oldTitle = sec.title;

  if (newType === 'fields') {
    Object.assign(sec, { type: 'fields', columns: 1, align: '', fields: [{ label: 'Поле 1' }] });
  } else if (newType === 'table') {
    Object.assign(sec, { type: 'table', headers: ['Название', 'Описание'], widths: ['40%', '60%'], rows: 5 });
    delete sec.columns; delete sec.align; delete sec.fields; delete sec.height;
  } else {
    Object.assign(sec, { type: 'textarea', height: 200 });
    delete sec.columns; delete sec.align; delete sec.fields;
    delete sec.headers; delete sec.widths; delete sec.rows;
  }

  sec.title = oldTitle;
  renderEditorForm();
}

/* ─────────────────── Ряды / колонки / секции ─────────────────── */

function addRow() {
  tpl().rows.push({
    columns: [{
      flex: 1,
      sections: [{ type: 'fields', title: 'Новая секция', columns: 1, align: '', fields: [{ label: 'Поле' }] }]
    }]
  });
  renderTree();
}

function removeRow(ri) {
  if (tpl().rows.length <= 1) { toast('Нельзя удалить последний ряд'); return; }
  tpl().rows.splice(ri, 1);
  AppState.editorSelection = { type: 'general' };
  renderEditor();
}

function addColumn(ri) {
  tpl().rows[ri].columns.push({
    flex: 1,
    sections: [{ type: 'fields', title: 'Новая секция', columns: 1, align: '', fields: [{ label: 'Поле' }] }]
  });
  renderTree();
}

function removeColumn(ri, ci) {
  if (tpl().rows[ri].columns.length <= 1) return;
  tpl().rows[ri].columns.splice(ci, 1);
  AppState.editorSelection = { type: 'general' };
  renderEditor();
}

function addSection(ri, ci) {
  tpl().rows[ri].columns[ci].sections.push({
    type: 'fields', title: 'Новая секция', columns: 1, align: '', fields: [{ label: 'Поле' }]
  });
  renderTree();
}

function removeSection(ri, ci, si) {
  const col = tpl().rows[ri].columns[ci];
  if (col.sections.length <= 1) { toast('Удалите колонку целиком'); return; }
  col.sections.splice(si, 1);
  AppState.editorSelection = { type: 'general' };
  renderEditor();
}

function moveSection(ri, ci, si, dir) {
  const secs = tpl().rows[ri].columns[ci].sections;
  const ni = si + dir;
  if (ni < 0 || ni >= secs.length) return;
  [secs[si], secs[ni]] = [secs[ni], secs[si]];
  AppState.editorSelection.secIdx = ni;
  renderEditor();
}

/* ─────────────────── Сохранение / удаление / экспорт ─────────────────── */

function saveCurrentTemplate() {
  saveToStorage();
  toast('Шаблон сохранён');
}

function deleteCurrentTemplate() {
  if (Object.keys(AppState.templates).length <= 1) {
    toast('Нельзя удалить единственный шаблон');
    return;
  }
  if (!confirm('Удалить шаблон "' + tpl().name + '"?')) return;
  delete AppState.templates[AppState.currentTemplateId];
  saveToStorage();
  AppState.currentTemplateId = null;
  showView('home');
  toast('Шаблон удалён');
}

function exportTemplate() {
  const t = tpl();
  downloadJSON(t, (t.name || 'template') + '.json');
  toast('Шаблон экспортирован');
}

function previewTemplate() {
  saveToStorage();
  AppState.charData = {};
  showView('sheet');
}
