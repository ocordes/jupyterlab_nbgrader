import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import { Widget } from '@lumino/widgets';

import { ToolbarButton, Dialog, showDialog } from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import {
  //NotebookActions,
  NotebookPanel,
  INotebookModel
} from '@jupyterlab/notebook';

import { requestAPI } from './handler';

const nbgrader_version = '0.7.0.dev';

function validate(data: any) {
  const body = document.createElement('div');
  body.id = 'validation-message';
  if (data.success === true) {
    if (typeof data.value === 'string') {
      data = JSON.parse(data.value);
    } else {
      data = data.value;
    }
    if (data.type_changed !== undefined) {
      for (let i = 0; i < data.type_changed.length; i++) {
        const cell = document.createElement('div');
        cell.innerHTML =
          '<p>The following ' +
          data.type_changed[i].old_type +
          ' cell has changed to a ' +
          data.type_changed[i].new_type +
          ' cell, but it should not have!</p>';
        body.append(cell);
        const source = document.createElement('pre');
        source.append(data.type_changed[i].source);
        body.append(source);
      }
      body.className = 'validation-type-changed';
    } else if (data.changed !== undefined) {
      for (let i = 0; i < data.changed.length; i++) {
        const cell = document.createElement('div');
        cell.innerHTML =
          '<p>The source of the following cell has changed, but it should not have!</p>';
        body.append(cell);
        const source = document.createElement('pre');
        source.append(data.type_changed[i].source);
        body.append(source);
      }
      body.className = 'validation-changed';
    } else if (data.passed !== undefined) {
      for (let i = 0; i < data.changed.length; i++) {
        const cell = document.createElement('div');
        cell.innerHTML = '<p>The following cell passed:</p>';
        body.append(cell);
        const source = document.createElement('pre');
        source.append(data.type_changed[i].source);
        body.append(source);
      }
      body.className = 'validation-passed';
    } else if (data.failed !== undefined) {
      for (let i = 0; i < data.failed.length; i++) {
        const cell = document.createElement('div');
        cell.innerHTML = '<p>The following cell failed:</p>';
        body.append(cell);
        const source = document.createElement('pre');
        source.append(data.failed[i].source);
        body.append(source);
        const error = document.createElement('pre');
        error.innerHTML = data.failed[i].error;
        body.append(error);
      }
      body.className = 'validation-failed';
    } else {
      const cell = document.createElement('div');
      cell.innerHTML = '<p>Success! Your notebook passes all the tests.</p>';
      body.append(cell);
      body.className = 'validation-success';
    }
  }
  return body;
}

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class ValidationButton
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  /**
   * Create a new extension object.
   */
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    let is_running = false;
    const callback = () => {
      if (is_running) {
        // callback is already running, return directly
        return;
      }
      // sets the state to running for the callback
      is_running = true;

      context.save().then(async () => {
        // is called when saving was successfull!
        button.node.querySelector('button').disabled = true;
        button.node.querySelectorAll('span')[1].innerText = 'Validating...';
        const check_version = await requestAPI<any>(
          'nbgrader_version',
          {},
          { version: nbgrader_version }
        ).then(values => {
          return values;
        });

        // check if the nbgrader version is compatible
        if (!check_version.success) {
          const body = document.createElement('div');
          body.innerHTML = '<p>' + check_version.message + '</p>';
          showDialog({
            title: 'Version Mismatch',
            body: new Widget({ node: body }),
            focusNodeSelector: 'input',
            buttons: [Dialog.okButton()]
          });
          button.node.querySelector('button').disabled = false;
          button.node.querySelectorAll('span')[1].innerText = 'Validate';
          is_running = false;
          return;
        }

        console.debug('validating the notebook');
        const data = new URLSearchParams();
        data.append('path', context.path);
        await requestAPI<any>('assignments/validate', {
          method: 'POST',
          body: data
        }).then(values => {
          // generate the dialog body corresponding to the results
          const body = validate(values);
          showDialog({
            title: 'Validation Results',
            body: new Widget({ node: body }),
            focusNodeSelector: 'input',
            buttons: [Dialog.okButton()]
          });
          button.node.querySelector('button').disabled = false;
          button.node.querySelectorAll('span')[1].innerText = 'Validate';
          is_running = false;
        });
      });
    };

    const button = new ToolbarButton({
      label: 'Validate',
      className: 'myButton',
      actualOnClick: false,
      onClick: callback,
      tooltip: 'Validate Notebook'
    });

    //panel.toolbar.insertItem(0, 'jp-nb-validate', button);
    panel.toolbar.insertAfter('cellType', 'jp-nb-validate', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}
