import * as vscode from 'vscode';
//import { Uri, Webview } from "vscode";
import { Utilities } from "../Utilities";

// function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
//   return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
// }

export class WebviewUIPanel {
	public static currentPanel: WebviewUIPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(context: vscode.ExtensionContext) {
    const extensionUri: vscode.Uri = context.extensionUri;
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (WebviewUIPanel.currentPanel) {
			WebviewUIPanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'WebviewUIPanel',
			'WebviewUIPanel',
			column || vscode.ViewColumn.One,
      {
        enableScripts: true
      }
		);
		WebviewUIPanel.currentPanel = new WebviewUIPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
    this._extensionUri = extensionUri;
    const webview = this._panel.webview;
    this._panel.title = 'WebviewUIPanel';
		this._panel.webview.html = this._getHtmlForWebview(webview);
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	public dispose() {
		WebviewUIPanel.currentPanel = undefined;
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

    //https://github.com/microsoft/vscode-webview-ui-toolkit
    //https://github.com/microsoft/vscode-webview-ui-toolkit-samples

		return `<!DOCTYPE html>
      <html style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;">
			<head>
				<meta charset="UTF-8">
        <script type="module" src="${toolkitUri}"></script>
			</head>
      <body style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;display:flex;flex-direction:column;">
				<div style="flex:1;border:1px solid red;">
          <vscode-button onclick="clickFunction()" id="howdy">Howdy!</vscode-button>
          <div id="result"></div>
          <vscode-text-area value="hello" resize="both">Text Area Label</vscode-text-area>
          <vscode-data-grid class="basic-grid" grid-template-columns="1fr 120px 1fr 2fr" aria-label="With Custom Column Widths"></vscode-data-grid>

        </div>
			</body>

      <script>
      const vscode = acquireVsCodeApi();
      var b = document.getElementById('result');

      function clickFunction() {

        b.innerHTML = b.innerHTML + 'button was clicked: ' + Date.now() + '<br/>'
        vscode.postMessage({command: 'showTerminal'})
      }
      </script>

			</html>`;
	}
}