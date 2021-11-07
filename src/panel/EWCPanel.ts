import * as vscode from 'vscode';
import { Utilities } from "../Utilities";

export class EWCPanel {
	public static currentPanel: EWCPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(context: vscode.ExtensionContext) {
    const extensionUri: vscode.Uri = context.extensionUri;
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (EWCPanel.currentPanel) {
			EWCPanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'EWCPanel',
			'EWCPanel',
			column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        //localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
		);
		EWCPanel.currentPanel = new EWCPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
    this._extensionUri = extensionUri;
    const webview = this._panel.webview;
    this._panel.title = 'EWCPanel';
		this._panel.webview.html = this._getHtmlForWebview(webview);
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	public dispose() {
		EWCPanel.currentPanel = undefined;
		this._panel.dispose();
		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {

    const toolkitUri = Utilities.getUri(webview, this._extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js",
    ]);



    const extModernAll = (vscode.Uri.joinPath(this._extensionUri, 'media', 'ext-modern-all.js')).with({ 'scheme': 'vscode-resource' });
    const themeMaterialAll1 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'theme-material-all_1.css')).with({ 'scheme': 'vscode-resource' });
    const themeMaterialAll2 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'theme-material-all_2.css')).with({ 'scheme': 'vscode-resource' });

    const ewcPanel = Utilities.getUri(webview, this._extensionUri, [
      "media",
      "EWC",
      "ext-panel.component.js",
    ]);




    const nonce = Utilities.getNonce();

		return `<!DOCTYPE html>
      <html style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;">
			<head>
        <meta charset="UTF-8">
        <script type="module" src="${toolkitUri}"></script>
        <link href="${themeMaterialAll1}" rel="stylesheet">
        <link href="${themeMaterialAll2}" rel="stylesheet">
        <script nonce="${nonce}" src="${extModernAll}"></script>
        <script nonce="${nonce}" src="${ewcPanel}" type="module"></script>

        <script>
        const vscode = acquireVsCodeApi();
        var b = document.getElementById('result');


  window.panelReady = function(a,b,c) {
    console.log('panelReady')
    console.log(a)
    console.log(a.detail)
    console.log(a.detail.cmp)
    console.log(b)
    console.log(c)
    a.detail.cmp.setTitle('reset')
  }

  window.clickFunction = function(a,b,c) {
    // Ext.theme.Material.setColors({
    //   base: 'red',
    //   baseWeight: accent: '300',
    //   accentWeight: '300',
    //   darkMode: true
    // });

console.log(Ext.theme.Material.setColors)


    var b = document.getElementById('result');
    b.innerHTML = b.innerHTML + 'button was clicked: ' + Date.now() + '<br/>'
    vscode.postMessage({command: 'showTerminal'})

  }
        </script>




			</head>
      <body>
      <div style="height:200px;color:white;">
      <ext-panel title="hi" fitToParent id="panel" xonReady="panelReady">
        <vscode-button onclick="clickFunction()" id="howdy">Howdy!</vscode-button>
      </ext-panel>
      <vscode-button onclick="clickFunction()" id="howdy">Howdy!</vscode-button>
      <div id="result"></div>
      </div>
      </body>






			</html>`;
	}
}