'use babel';

import path from 'path';
import etch from 'etch';
const $ = etch.dom;
const pkg = require('../package.json');

export default class StarredProjectsComponent {
  constructor({ paths, openedPaths, onClickItem }) {
    this.props = { paths, openedPaths, onClickItem };
    etch.initialize(this);
  }

  update({ paths, openedPaths }) {
    if (paths !== undefined) {
      this.props.paths = paths;
    }
    if (openedPaths !== undefined) {
      this.props.openedPaths = openedPaths;
    }
    return etch.update(this);
  }

  render() {
    return $.div(
      { className: pkg.name },
      $.ul(
        {},
        this.props.paths.map(p =>
          $.li(
            {
              className: ['icon', 'icon-star']
                .concat(this.props.openedPaths.indexOf(p) !== -1 ? 'active' : [])
                .join(' '),
              dataset: {
                path: p,
              },
              on: {
                click: this.props.onClickItem,
              },
            },
            path.basename(p)
          )
        )
      )
    );
  }

  async destroy() {
    await etch.destroy(this);
  }
}
