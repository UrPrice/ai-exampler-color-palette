/**
 * sheet.js — Рендер и управление листом персонажа.
 * Зависимости: state.js, utils.js, navigation.js
 */

/* ─────────────────── Auto-resize textarea ─────────────────── */

/**
 * Устанавливает высоту textarea по содержимому.
 * @param {HTMLTextAreaElement} el
 */
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

/**
 * Навешивает авто-ресайз на все textarea[data-fid] внутри корневого элемента.
 * @param {HTMLElement} root
 */
function initAutoResize(root) {
  root.querySelectorAll('textarea[data-fid]').forEach(ta => {
    autoResize(ta);
    ta.addEventListener('input', () => autoResize(ta));
  });
}

/* ─────────────────── Рендер листа ─────────────────── */

/**
 * Генерирует HTML листа персонажа и вставляет его в #sheet-content.
 * Привязывает обработчики input для сохранения данных в AppState.charData.
 */
function renderSheet() {
  if (!AppState.currentTemplateId || !AppState.templates[AppState.currentTemplateId]) {
    showView('home');
    return;
  }

  const t = AppState.templates[AppState.currentTemplateId];
  const el = document.getElementById('sheet-content');

  let html = `
    <div class="splatter-1"></div>
    <h1>${esc(t.title)}</h1>
    <div class="sheet-subtitle">${esc(t.subtitle)}</div>`;

  t.rows.forEach((row, ri) => {
    const flexes = row.columns.map(c => (c.flex || 1) + 'fr').join(' ');
    const marginBottom = ri < t.rows.length - 1 ? '20' : '0';

    html += `<div class="sheet-row"
      style="display:grid;grid-template-columns:${flexes};gap:20px;margin-bottom:${marginBottom}px">`;

    row.columns.forEach((col, ci) => {
      html += `<div class="sheet-col">`;

      col.sections.forEach((sec, si) => {
        html += buildSectionHTML(sec, ri, ci, si);
      });

      html += `</div>`;
    });

    html += `</div>`;
  });

  el.innerHTML = html;

  /* Привязка данных */
  el.querySelectorAll('[data-fid]').forEach(inp => {
    inp.addEventListener('input', () => {
      AppState.charData[inp.dataset.fid] = inp.value;
    });
  });

  initAutoResize(el);
}

/**
 * Строит HTML одной секции листа персонажа.
 * @param {Object} sec
 * @param {number} ri rowIndex
 * @param {number} ci columnIndex
 * @param {number} si sectionIndex
 * @returns {string}
 */
function buildSectionHTML(sec, ri, ci, si) {
  const sid = `${ri}_${ci}_${si}`;

  if (sec.type === 'fields') {
    let h = `<div class="box">
      <div class="box-title">${esc(sec.title)}</div>
      <div class="info-grid" style="grid-template-columns:repeat(${sec.columns || 1},1fr)">`;

    (sec.fields || []).forEach((f, fi) => {
      const fid = `f_${sid}_${fi}`;
      const val = AppState.charData[fid] || '';
      const align = sec.align ? `style="text-align:${sec.align}"` : '';
      h += `<div class="info-row">
        <span>${esc(f.label)}:</span>
        <input type="text" data-fid="${fid}" value="${esc(val)}" ${align}>
      </div>`;
    });

    h += `</div></div>`;
    return h;
  }

  if (sec.type === 'table') {
    let h = `<div class="box" style="flex:1;display:flex;flex-direction:column">
      <div class="box-title">${esc(sec.title)}</div>
      <table><tr>`;

    (sec.headers || []).forEach((hd, hi) => {
      const w = (sec.widths || [])[hi];
      h += `<th ${w ? `style="width:${w}"` : ''}>${esc(hd)}</th>`;
    });
    h += `</tr>`;

    for (let r = 0; r < (sec.rows || 5); r++) {
      h += `<tr>`;
      (sec.headers || []).forEach((hd, hi) => {
        const fid = `t_${sid}_${r}_${hi}`;
        const val = AppState.charData[fid] || '';
        h += `<td><textarea data-fid="${fid}" rows="1">${esc(val)}</textarea></td>`;
      });
      h += `</tr>`;
    }

    h += `</table></div>`;
    return h;
  }

  if (sec.type === 'textarea') {
    const fid = `ta_${sid}`;
    const val = AppState.charData[fid] || '';
    return `<div class="box" style="min-height:${sec.height || 200}px">
      <div class="box-title">${esc(sec.title)}</div>
      <textarea class="box-textarea" data-fid="${fid}">${esc(val)}</textarea>
    </div>`;
  }

  return '';
}

/* ─────────────────── Управление данными ─────────────────── */

/**
 * Считывает текущие значения всех полей листа в AppState.charData.
 */
function collectSheetData() {
  document.getElementById('sheet-content').querySelectorAll('[data-fid]').forEach(inp => {
    AppState.charData[inp.dataset.fid] = inp.value;
  });
}

/**
 * Очищает все поля листа персонажа.
 */
function clearSheetFields() {
  if (!confirm('Очистить все поля?')) return;
  AppState.charData = {};
  renderSheet();
  toast('Поля очищены');
}
