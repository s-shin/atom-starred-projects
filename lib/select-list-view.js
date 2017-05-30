'use babel';

import SelectList from 'atom-select-list';

export default class SelectPathListView {

  selectList = null;
  panel = null;
  prevFocusedElement = null;
  onSelected = null;

  constructor() {
    this.selectList = new SelectList({
      items: [],
      elementForItem: item => {
        const el = document.createElement('li');
        el.textContent = item;
        return el;
      },
      didConfirmSelection: item => {
        if (this.onSelected) {
          this.onSelected(item);
        }
        this._hide();
      },
      didCancelSelection: () => {
        this._hide();
      }
    });
  }

  showWith({ paths, onSelected }) {
    this.onSelected = onSelected;
    this.selectList.update({ items: paths });
    this._show();
  }

  _show() {
    if (this.panel) {
      return;
    }
    this.prevFocusedElement = document.activeElement;
    this.panel = atom.workspace.addModalPanel({ item: this.selectList });
    this.selectList.focus();
  }

  _hide() {
    if (!this.panel) {
      return;
    }
    this.panel.hide();
    this.panel = null;
    if (this.prevFocusedElement) {
      this.prevFocusedElement.focus();
      this.prevFocusedElement = null;
    }
  }

  async destroy() {
    await this.selectList.destroy();
  }
}
