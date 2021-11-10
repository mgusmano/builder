import * as vscode from 'vscode';
import { Utilities } from "../Utilities";

export class ExtJSPanel {
	public static currentPanel: ExtJSPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(context: vscode.ExtensionContext) {
    const extensionUri: vscode.Uri = context.extensionUri;
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (ExtJSPanel.currentPanel) {
			ExtJSPanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'ExtJSPanel',
			'ExtJSPanel',
			column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
		);
		ExtJSPanel.currentPanel = new ExtJSPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
    this._extensionUri = extensionUri;
    const webview = this._panel.webview;
    this._panel.title = 'ExtJSPanel';
		this._panel.webview.html = this._getHtmlForWebview(webview);
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	public dispose() {
		ExtJSPanel.currentPanel = undefined;
		this._panel.dispose();
		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
    const extModernAll = (vscode.Uri.joinPath(this._extensionUri, 'media', 'ext-modern-all.js')).with({ 'scheme': 'vscode-resource' });
    const themeAll1 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'buildertheme-all-debug_1.css')).with({ 'scheme': 'vscode-resource' });
    const themeAll2 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'buildertheme-all-debug_2.css')).with({ 'scheme': 'vscode-resource' });
    const nonce = Utilities.getNonce();

		return `<!DOCTYPE html>
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
        .x-panelheader-accordion {
          background-color: var(--vscode-activityBar-activeBackground);
        }
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
        .data {
          color: var(--vscode-editor-foreground);
        }
        </style>
			</head>
      <body id='extbody'></body>
      <script>
      Ext.onReady(function() {
        Ext.application({
          name: 'MyApp',
          launch: function() {
            console.log(document.getElementById('extbody'))
            Ext.Viewport.add({
              xtype: 'panel',
              title: 'hi',
              style: "borderLeft:1px solid lightgray;borderTop:1px solid lightgray;borderRight:21px solid lightgray;borderBottom:1px solid lightgray;",
              border: true,
              layout: {
                type: 'vbox',
                align: 'stretch'
              },
              defaultType: 'panel',

              items: [
                {
                  docked: 'top',
                  xbodyStyle: {background: 'gray', color: 'white'},
                  height: 30,
                  resizable: {
                      split: true,
                      //maxSize: [null,100],
                      edges: 'south'
                  }
                },
                {
                  html: 'Dock Bottom',
                  docked: 'bottom',
                  minHeight: 30,
                  resizable: {
                    split: true,
                    edges: 'north'
                  }
                },
                {
                  html: 'Dock Left',
                  style: 'width:5px;',
                  docked: 'left',
                  minWidth: 100,
                  resizable: {
                    //minSize: 2,
                    //maxSize: 2,
                    split: true,
                    edges: 'east'
                  },
                  items: [
                    {xtype:'button',text:'click',handler:function(){console.log('click')}}
                  ]
                },
                {
                  xtype: 'accordion',
                  docked: 'right',
                  minWidth: 100,
                  resizable: {
                    split: true,
                    edges: 'west'
                  },
                  defaults: {
                    xtype: 'panel',
                    bodyPadding: 10,
                    flex: 1
                  },

                items: [
                  {
                    title: 'Accordion Item 1',
                    tools: [
                        { iconCls: 'x-fa fa-thumb-tack' },
                        { iconCls: 'x-fa fa-thumb-tack fa-rotate-90' },
                        { iconCls: 'x-fa fa-gear' }
                    ],
                    html: 'ff'
                },
                {
                    title: 'Accordion Item 2',
                    layout: 'fit',
                    bodyPadding: 0,
                    // items: [{
                    //     xtype: 'dataview-inline'
                    // }]
                },
                {
                    title: 'Accordion Item 3 (titleCollapse)',
                    titleCollapse: true,
                    tools: [
                        { iconCls: 'x-fa fa-thumb-tack' },
                        { iconCls: 'x-fa fa-thumb-tack fa-rotate-90' },
                        { iconCls: 'x-fa fa-gear' }
                    ],
                    layout: 'fit',
                    // items: [{
                    //     xtype: 'array-grid'
                    // }]
                },
                {
                    title: 'Accordion Item 4',
                    html: 'lll'
                }
              ]
                },

                {
                  html: '<div class="data">Unresizable region</div>',
                  flex: 1
                }
              ]
            });
          }
        });
      });
      </script>
			</html>`;
	}
}