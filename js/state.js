/**
 * state.js — Глобальное состояние приложения
 * Все модули читают и пишут через этот объект.
 */

const AppState = {
  /** @type {Object.<string, Object>} Словарь шаблонов { id: templateObject } */
  templates: {},

  /** @type {string|null} ID текущего открытого шаблона */
  currentTemplateId: null,

  /**
   * Текущий выбор в редакторе.
   * @type {{ type: 'general'|'section', rowIdx?: number, colIdx?: number, secIdx?: number }|null}
   */
  editorSelection: null,

  /** @type {Object.<string, string>} Данные персонажа { fieldId: value } */
  charData: {},
};
