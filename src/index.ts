import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  IDisposable, DisposableDelegate
} from '@lumino/disposable';


import {
  ToolbarButton
} from '@jupyterlab/apputils';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookActions, NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';



/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export
  class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let callback = () => {
      NotebookActions.runAll(panel.content, context.sessionContext);
    };
    let button = new ToolbarButton({
      className: 'myButton',
      iconClass: 'fa fa-fast-forward',
      onClick: callback,
      tooltip: 'Run All'
    });

    panel.toolbar.insertItem(0, 'runAll', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}


/**
 * Activate the extension.
 */
function activate(app: JupyterFrontEnd) {
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
};


/**
 * Initialization data for the jupyterlab_nbgrader extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_nbgrader:plugin',
  autoStart: true,
  activate: activate
  //activate: (app: JupyterFrontEnd) => {
  //  console.log('JupyterLab extension jupyterlab_nbgrader is activated!');
  //}
};

export default extension;
