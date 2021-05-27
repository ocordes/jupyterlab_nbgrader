import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import '../style/index.css';

import { ValidationButton } from './validate_assignment';

/**
 * Activate the extension.
 */
function activate(app: JupyterFrontEnd) {
  app.docRegistry.addWidgetExtension('Notebook', new ValidationButton());
  console.debug('JupyterLab extension jupyterlab_nbgrader is activated!');
}

/**
 * Initialization data for the jupyterlab_nbgrader extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_nbgrader:plugin',
  autoStart: true,
  activate: activate
};

export default extension;
