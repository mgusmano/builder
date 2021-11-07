import * as vscode from 'vscode';
import { Utilities } from "../Utilities";

//https://code.visualstudio.com/api/extension-guides/webview#theming-webview-content
//https://code.visualstudio.com/api/references/theme-color
//https://marketplace.visualstudio.com/items?itemName=connor4312.css-theme-completions

export class ThemePanel {
	public static currentPanel: ThemePanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(context: vscode.ExtensionContext) {
    const extensionUri: vscode.Uri = context.extensionUri;
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (ThemePanel.currentPanel) {
			ThemePanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'ThemePanel',
			'ThemePanel',
			column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        //localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
		);
		ThemePanel.currentPanel = new ThemePanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
    this._extensionUri = extensionUri;
    const webview = this._panel.webview;
    this._panel.title = 'ThemePanel';
		this._panel.webview.html = this._getHtmlForWebview(webview);
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	public dispose() {
		ThemePanel.currentPanel = undefined;
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
    const themeMaterialAll1 = (vscode.Uri.joinPath(this._extensionUri, 'media', 't3-all-debug_1.css')).with({ 'scheme': 'vscode-resource' });
    const themeMaterialAll2 = (vscode.Uri.joinPath(this._extensionUri, 'media', 't3-all-debug_2.css')).with({ 'scheme': 'vscode-resource' });
    const nonce = Utilities.getNonce();

		return `<!DOCTYPE html>
      <html style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;">
			<head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10, user-scalable=yes">
        <title>ExtJSPanel</title>
        <script nonce="${nonce}" src="${extModernAll}"></script>
        <link href="${themeMaterialAll1}" rel="stylesheet">
        <link href="${themeMaterialAll2}" rel="stylesheet">
        <style>
        .x-panelheader {
          background-color: var(--vscode-activityBar-background);
        }
        .x-paneltitle {
          color: var(--vscode-editor-foreground);
        }
        .x-panel-body-el {
          background-color: var(--vscode-editor-background);
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
              });
            }
          });
        });
      </script>
			</html>`;
	}

	private _getHtmlForWebview2(webview: vscode.Webview) {
		return `<!DOCTYPE html>
      <html style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;">
			<head>
				<meta charset="UTF-8">
			</head>
      <body style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;display:flex;flex-direction:column;">
				<div style="flex:1;border:1px solid red;">ThemePanel</div>
			</body>
			</html>`;
	}
}