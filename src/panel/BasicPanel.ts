import * as vscode from 'vscode';

export class BasicPanel {
	public static currentPanel: BasicPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(context: vscode.ExtensionContext) {
    const extensionUri: vscode.Uri = context.extensionUri;
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (BasicPanel.currentPanel) {
			BasicPanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'BasicPanel',
			'BasicPanel',
			column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
		);
		BasicPanel.currentPanel = new BasicPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
    const webview = this._panel.webview;
    this._panel.title = 'BasicPanel';
		this._panel.webview.html = this._getHtmlForWebview(webview);
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	public dispose() {
		BasicPanel.currentPanel = undefined;
		this._panel.dispose();
		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		return `<!DOCTYPE html>
      <html style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;">
			<head>
				<meta charset="UTF-8">
			</head>
      <body style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;display:flex;flex-direction:column;">
				<div style="flex:1;border:1px solid red;">BasicPanel</div>
			</body>
			</html>`;
	}
}