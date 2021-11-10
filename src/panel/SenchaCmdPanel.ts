import * as vscode from 'vscode';
import * as os from 'os';
const fs = require('fs');
import { Utilities } from "../Utilities";
import { SenchaCmdPanelHTML } from "./SenchaCmdPanelHtml";

export class SenchaCmdPanel {
  public _context: vscode.ExtensionContext;
  private readonly _extensionUri: vscode.Uri;
	public static currentPanel: SenchaCmdPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];
  public _toolkit: any;
  public _theme: any;
  public _applicationName: any;
  public _applicationPath: any;

	public static createOrShow(context: vscode.ExtensionContext) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (SenchaCmdPanel.currentPanel) {
			SenchaCmdPanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'SenchaCmdPanel',
			'SenchaCmdPanel',
			column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
      }
		);
		SenchaCmdPanel.currentPanel = new SenchaCmdPanel(panel, context);
	}

	private constructor(webviewPanel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
		this._panel = webviewPanel;
    this._context = context;
    this._extensionUri = context.extensionUri;
    const webview = this._panel.webview;
    this._panel.title = 'SenchaCmdPanel';
		this._panel.webview.html = this._getHtmlForWebview(webview);
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this.messagesFromVSCode(this._panel);
    this.messagesFromWebview(this._panel, context);
	}

  public messagesFromVSCode = (webviewPanel:vscode.WebviewPanel) => {
    // this._context.subscriptions.push(
    //   vscode.window.onDidChangeActiveColorTheme((e) => {
    //     console.log(e);
    //     console.log("mjg changeActiveColorSubscription");
    //     webviewPanel.webview.postMessage({
    //       type: "extjsdesignerthemechange",
    //       text: '',
    //     });
    //   })
    // );
  };

  public messagesFromWebview = (webviewPanel:vscode.WebviewPanel,context:vscode.ExtensionContext) => {

    webviewPanel.webview.onDidReceiveMessage((message) => {
      console.log(message);
      switch (message.command) {
        case "open":
          let uri = vscode.Uri.file(`${this._applicationPath}/${this._applicationName}`);
          vscode.commands.executeCommand('vscode.openFolder', uri);
          break;
        case "runcmd":
          const dirExists = fs.existsSync(`${message.applicationPath}/${message.applicationName}`);
          if (dirExists === true) {
            vscode.window.showErrorMessage(`Directory exists: ${message.applicationPath}/${message.applicationName}`);
            return;
          }
          const term = vscode.window.createTerminal(`Sencha Builder`);
          term.show();
          term.sendText(`chdir ${os.homedir()}/SenchaApps`);
          var cmd = `sencha generate app --ext -${message.toolkit} --theme-name theme-${message.theme} ${message.applicationName} ${message.applicationPath}/${message.applicationName}`;
          term.sendText(cmd);

          this._toolkit = message.toolkit;
          this._theme = message.theme;
          this._applicationName = message.applicationName;
          this._applicationPath = message.applicationPath;
          break;
      }
    });
  };

	public dispose() {
		SenchaCmdPanel.currentPanel = undefined;
		this._panel.dispose();
		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const extModernAll = (vscode.Uri.joinPath(this._extensionUri, 'media', 'ext-modern-all-debug.js')).with({ 'scheme': 'vscode-resource' });
    const themeAll1 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'buildertheme-all-debug_1.css')).with({ 'scheme': 'vscode-resource' });
    const themeAll2 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'buildertheme-all-debug_2.css')).with({ 'scheme': 'vscode-resource' });
    const nonce = Utilities.getNonce();
    const sencha = (vscode.Uri.joinPath(this._extensionUri, 'media', 'SenchaLogoLg.svg')).with({ 'scheme': 'vscode-resource' });

    var s = `<!DOCTYPE html>
    <html style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;">
    <head>
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10, user-scalable=yes">
      <title>ExtJSPanel</title>
      <script nonce="${nonce}" src="${extModernAll}"></script>
      <link href="${themeAll1}" rel="stylesheet">
      <link href="${themeAll2}" rel="stylesheet">
      <style>
      .x-panelheader {
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
      }
      .x-paneltitle {
        color: var(--vscode-editor-foreground);
      }
      .x-panel-body-el {
        background-color: var(--vscode-editor-background);
      }
      .toolbar {
        background-color: var(--vscode-sideBar-background);
      }
      .x-toolbar {
          background-color: var(--vscode-sideBar-background);
      }
      </style>
    </head>
    <body id='extbody'></body>
    <script>
    Ext.onReady(function() {

      Ext.define('MyController', {
        extend: 'Ext.app.ViewController',
        alias: 'controller.mycontroller',

        onSubmit: function () {
          var form = this.getView();
          console.log(form)
          console.log(form.validate());
          console.log(form.getValues());

          if (form.validate() === true) {
            var theme = form.getValues().theme;

            vscode.postMessage({
              command: 'runcmd',
              toolkit: form.getValues().toolkit,
              theme: form.getValues().theme,
              applicationName: form.getValues().applicationName,
              applicationPath: form.getValues().applicationPath
            })
          }
        },

        onOpen: function () {
          console.log('onOpen')
          console.log(this._applicationName)
          console.log(this._applicationPath)
          vscode.postMessage({
            command: 'open'
          })
        },

      });

      Ext.application({
        name: 'MyApp',
        launch: function() {
          console.log(document.getElementById('extbody'))
          Ext.Viewport.add(
            {
              xtype: 'formpanel',
              title: 'Sencha Builder',
              style: "borderLeft:1px solid lightgray;borderTop:1px solid lightgray;borderRight:21px solid lightgray;borderBottom:1px solid lightgray;",
              border: true,
              padding: 20,
              //layout: {type: 'vbox',pack: 'top', align: 'middle'},
              controller: 'mycontroller',
              buttons: {
                submit: 'onSubmit'
              },
              items: [
                {
                  docked:'top',height:45,bodyStyle:'background:whitesmoke;',
                  cls: 'toolbar',
                  resizable: {split:true,edges:'south'},
                  items: [
                    {xtype:'button',text:'Open New ExtJS Folder',style:'marginTop:6px;marginLeft:15px;fontStyle:italic;',handler:'onOpen'}
                  ]
                },
                ${SenchaCmdPanelHTML.getImage(sencha)}
                {
                  xtype: 'fieldset',
                  layout: {type: 'vbox',pack: 'top', align: 'middle'},
                  defaults: {
                    labelAlign: 'top',
                    width: '70%'
                  },
                  items: [
                    {
                      xtype: 'combobox',
                      label: 'Toolkit',
                      name: 'toolkit',
                      required: true,
                      valueField: 'name',
                      displayField: 'name',
                      forceSelection: true,
                      value: 'modern',
                      queryMode: 'local',
                      clearable: true,
                      placeholder: 'Select a toolkit...',
                      store: {
                        data: [
                          {name: 'modern'},
                          {name: 'classic'},
                        ]
                      }
                    },
                    {
                      xtype: 'combobox',
                      label: 'Theme',
                      name: 'theme',
                      required: true,
                      valueField: 'name',
                      displayField: 'name',
                      forceSelection: true,
                      value: 'material',
                      queryMode: 'local',
                      clearable: true,
                      placeholder: 'Select a theme...',
                      store: {
                        data: [
                          {name: 'material'},
                          {name: 'ios'},
                          {name: 'triton'},
                        ]
                      }
                    },
                    {
                      xtype: 'textfield',
                      label: 'Application Name',
                      placeholder: 'Application Name',
                      name: 'applicationName',
                      value:'myapp',
                      allowBlank: false,
                      readOnly: false,
                      required: true,
                      errorTarget: 'qtip',
                      //style: {'margin': 'auto'}
                    },
                    {
                      xtype: 'textfield',
                      label: 'Application Path',
                      placeholder: 'Application Path',
                      name: 'applicationPath',
                      value:'${os.homedir()}/SenchaApps',
                      allowBlank: false,
                      readOnly: false,
                      required: true,
                      errorTarget: 'qtip',
                      //style: {'margin': 'auto'}
                    },
                  ]
                }
              ]
            }
          )
        }
      });

    });
    </script>

    <script>
    const vscode = acquireVsCodeApi();
    </script>

    </html>`;
    return s;
	}

}