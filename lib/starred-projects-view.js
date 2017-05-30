'use babel';

import StarredProjectsComponent from './starred-projects-component'

STARRED_PROJECTS_VIEW_URI = 'atom://starred-projects/view'

export default class StarredProjectsView {
  constructor({ paths, openedPaths }) {
    this.component = new StarredProjectsComponent({
      paths,
      openedPaths,
      onClickItem(e) {
        atom.project.addPath(e.target.dataset.path);
      },
    });
  }

  async destroy() {
    await this.component.destroy();
  }

  getElement() {
    return this.component.element;
  }

  getTitle() {
    return 'Starred Projects';
  }

  getURI() {
    return STARRED_PROJECTS_VIEW_URI;
  }

  getDefaultLocation() {
    return 'left';
  }

  setProjectPaths(paths) {
    this.component.update({ paths });
  }

  setOpenedProjectPaths(openedPaths) {
    this.component.update({ openedPaths });
  }
}
