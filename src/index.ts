import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupyterlab_nbgrader extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_nbgrader:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab_nbgrader is activated!');
  }
};

export default extension;
