'use babel';

import StarredProjectsView from './starred-projects-view';
import SelectListView from './select-list-view';
import { CompositeDisposable } from 'atom';
const pkg = require('../package');

CONFIG_KEYS = {
  STARRED_PROJECT_PATHS: 'starredProjectPath',
};

export default new class {
  projectSelectList = null
  starredProjectView = null
  selectListView = null
  subscriptions = null

  /**
   * @see http://flight-manual.atom.io/hacking-atom/sections/package-word-count/
   */
  activate(state) {
    this.starredProjectView = new StarredProjectsView({
      paths: this.getStarredProjectPaths(),
      openedPaths: atom.workspace.project.getPaths(),
    });
    this.selectListView = new SelectListView();

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'starred-projects:toggle': () => {
        this.toggle();
      },
      'starred-projects:star': e => {
        let projectPath = this.detectProjectPathFromEvent(e);
        if (projectPath !== "") {
          this.starProject(projectPath);
          return;
        }
        atom.notifications.addInfo(pkg.name, {
          description: '`starred-projects:star` is available only on the context menu.',
        });
      },
      'starred-projects:unstar': e => {
        if (e.target.dataset.path) {
          this.unstarProject(e.target.dataset.path);
          return;
        }
        this.selectListView.showWith({
          paths: this.getStarredProjectPaths(),
          onSelected: projectPath => {
            this.unstarProject(projectPath);
          },
        });
      },
      'starred-projects:open': e => {
        const openedPaths = this.getOpenedProjectPaths();
        const notOpenedPaths = this.getStarredProjectPaths().filter(p => openedPaths.indexOf(p) === -1);
        if (notOpenedPaths.length > 0) {
          this.selectListView.showWith({
            paths: notOpenedPaths,
            onSelected: projectPath => {
              this.openProject(projectPath);
            },
          });
          return;
        }
        atom.notifications.addInfo(pkg.name, {
          description: `All starred projects are opened.`,
        });
      },
    }));

    this.subscriptions.add(atom.config.observe(`${pkg.name}.${CONFIG_KEYS.STARRED_PROJECT_PATHS}`, {}, (value) => {
      this.starredProjectView.setProjectPaths(value);
    }));

    this.subscriptions.add(atom.workspace.project.onDidChangePaths(paths => {
      this.starredProjectView.setOpenedProjectPaths(paths);
    }));
  }

  /**
   * @see http://flight-manual.atom.io/hacking-atom/sections/package-word-count/
   */
  deactivate() {
    this.subscriptions.dispose();
    this.starredProjectView.destroy();
    this.selectListView.destroy();
  }

  /**
   * @see http://flight-manual.atom.io/hacking-atom/sections/package-word-count/
   */
  serialize() {
    return {};
  }

  toggle() {
    atom.workspace.toggle(this.starredProjectView);
  }

  detectProjectPathFromEvent(e) {
    // NOTE: We need to look `e.target` because `e.currentTarget` seems to
    // always indicates <atom-workspace>.
    if (e.target.dataset.path) {
      return String(e.target.dataset.path);
    }
    if (e.target.classList.contains('project-root-header')) {
      const el = e.target.querySelector('[data-path]');
      if (el.dataset.path) {
        return String(el.dataset.path);
      }
    }
    return "";
  }

  starProject(projectPath) {
    const paths = this.getStarredProjectPaths();
    if (paths.indexOf(projectPath) !== -1) {
      atom.notifications.addInfo(pkg.name, {
        description: `${projectPath} has already been starred.`,
      });
      return;
    }
    this.setStarredProjectPaths(paths.concat(projectPath));
  }

  unstarProject(projectPath) {
    const paths = this.getStarredProjectPaths();
    if (paths.indexOf(projectPath) === -1) {
      atom.notifications.addInfo(pkg.name, {
        description: `${projectPath} is not starred.`,
      });
      return;
    }
    this.setStarredProjectPaths(paths.filter(p => p !== projectPath));
  }

  openProject(projectPath) {
    atom.project.addPath(projectPath);
  }

  setStarredProjectPaths(paths) {
    return atom.config.set(`${pkg.name}.${CONFIG_KEYS.STARRED_PROJECT_PATHS}`, paths);
  }

  getStarredProjectPaths() {
    return atom.config.get(`${pkg.name}.${CONFIG_KEYS.STARRED_PROJECT_PATHS}`);
  }

  getOpenedProjectPaths() {
    return atom.workspace.project.getPaths();
  }

};
