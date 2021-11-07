import * as vscode from 'vscode';

export class MessagingPanel {
	public static currentPanel: MessagingPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(context: vscode.ExtensionContext) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (MessagingPanel.currentPanel) {
			MessagingPanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'MessagingPanel',
			'MessagingPanel',
			column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
      }
		);
		MessagingPanel.currentPanel = new MessagingPanel(panel, context);
	}

	private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
		this._panel = panel;
    const webview = this._panel.webview;
    this._panel.title = 'MessagingPanel';
		this._panel.webview.html = this._getHtmlForWebview(webview);
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this.messagesFromWebviewAndVSCode(this._panel, context);
	}

  public messagesFromWebviewAndVSCode = (webviewPanel:vscode.WebviewPanel,context:vscode.ExtensionContext) => {

    context.subscriptions.push(
      vscode.window.onDidChangeActiveColorTheme((e) => {
        console.log(e);
        console.log("mjg changeActiveColorSubscription");
        webviewPanel.webview.postMessage({
          type: "extjsdesignerthemechange",
          text: '',
        });
      })
    );

    webviewPanel.webview.onDidReceiveMessage((message) => {
      console.log(message);
      switch (message.command) {
        case "additems":
          break;
        case "showTerminal":
            vscode.commands.executeCommand("workbench.action.terminal.toggleTerminal")
              .then(function () {});
            break;
      }
    });
  };

	public dispose() {
		MessagingPanel.currentPanel = undefined;
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
        <body style="width:100%;height:100%;margin:0;padding:0;overflow:scroll;display:flex;flex-direction:column;">
          <div style="flex:1;border:1px solid red;">
            <div>MessagingPanel</div>
            <button onclick="clickFunction()">Click me</button>
            <div id="result"></div>

          </div>
        </body>

        <script>
          const vscode = acquireVsCodeApi();
          var b = document.getElementById('result');

          function clickFunction() {

            b.innerHTML = b.innerHTML + 'button was clicked: ' + Date.now() + '<br/>'
            vscode.postMessage({command: 'showTerminal'})
          }

          window.addEventListener('message', event => {
            console.log('we have a new message',event)
            const message = event.data; // The JSON data our extension sent
            switch (message.type) {
              case 'extjsdesignerthemechange':
                console.log('in the case: extjsdesignerthemechange from the extension')
                b.innerHTML  = b.innerHTML + 'extjsdesignerthemechange from the extension' + '<br/>'
                break;
            }
          });
        </script>

		  </html>`;
	}
}