/**
 * pdf-export.js — Экспорт листа персонажа в PDF через html2pdf.js.
 *
 * html2canvas не рендерит содержимое <textarea> и теряет value у <input>,
 * поэтому перед захватом заменяем интерактивные элементы на статичные
 * div/span, а после сохранения восстанавливаем оригиналы.
 *
 * Зависимости: state.js, utils.js, sheet.js
 */

/**
 * Экспортирует текущий лист персонажа в PDF-файл.
 */
function exportPDF() {
  collectSheetData();

  const element = document.getElementById('sheet-content');
  const name = AppState.templates[AppState.currentTemplateId]?.name || 'character-sheet';
  toast('Генерация PDF…');

  const swaps = [];

  /* ——— 1. Подмена textarea → div ——— */
  element.querySelectorAll('textarea[data-fid]').forEach(ta => {
    const div = document.createElement('div');
    div.className = 'pdf-swap-div';

    /* Получаем фактические пиксельные размеры до замены */
    const taRect = ta.getBoundingClientRect();
    const cs = window.getComputedStyle(ta);

    /* Фиксированная пиксельная ширина — ключевое условие для переноса строк в html2canvas */
    div.style.width        = taRect.width + 'px';
    div.style.maxWidth     = taRect.width + 'px';
    div.style.boxSizing    = 'border-box';

    div.style.fontSize     = cs.fontSize;
    div.style.fontFamily   = cs.fontFamily;
    div.style.fontWeight   = cs.fontWeight;
    div.style.lineHeight   = cs.lineHeight;
    div.style.padding      = cs.padding;
    div.style.color        = cs.color;
    div.style.textAlign    = cs.textAlign;
    div.style.display      = 'block';
    div.style.whiteSpace   = 'pre-wrap';
    div.style.wordBreak    = 'break-word';
    div.style.overflowWrap = 'break-word';
    div.style.overflow     = 'visible';

    /* Высота по содержимому, не меньше текущей высоты textarea */
    div.style.minHeight = taRect.height + 'px';

    /* Если это box-textarea — копируем фон-линейку */
    if (ta.classList.contains('box-textarea')) {
      div.style.backgroundImage = cs.backgroundImage;
      div.style.backgroundSize  = cs.backgroundSize;
    }

    div.textContent = ta.value;

    swaps.push({ original: ta, replacement: div });
    ta.parentNode.replaceChild(div, ta);
  });

  /* ——— 2. Подмена input[type=text] → span ——— */
  element.querySelectorAll('input[type="text"][data-fid]').forEach(inp => {
    const span = document.createElement('span');
    span.className = 'pdf-swap-span';

    const cs = window.getComputedStyle(inp);
    span.style.fontSize     = cs.fontSize;
    span.style.padding      = cs.padding;
    span.style.borderBottom = cs.borderBottom;
    span.style.textAlign    = cs.textAlign;
    span.style.minHeight    = cs.height;

    span.textContent = inp.value;

    swaps.push({ original: inp, replacement: span });
    inp.parentNode.replaceChild(span, inp);
  });

  /* ——— 3. Вычисляем итоговые размеры страницы ——— */
  const rect     = element.getBoundingClientRect();
  const widthMM  = 210;
  const heightMM = Math.max(297, Math.ceil(rect.height / rect.width * widthMM) + 2);

  const opt = {
    margin:      0,
    filename:    name + '.pdf',
    image:       { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#c7bcae' },
    jsPDF:       { unit: 'mm', format: [widthMM, heightMM], orientation: 'portrait' }
  };

  /* ——— 4. Восстановление оригинальных элементов ——— */
  function restore() {
    swaps.forEach(({ original, replacement }) => {
      if (replacement.parentNode) replacement.parentNode.replaceChild(original, replacement);
    });
  }

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(()  => { restore(); toast('PDF сохранён'); })
    .catch(() => { restore(); toast('Ошибка. Попробуйте Ctrl+P → Сохранить как PDF'); });
}
