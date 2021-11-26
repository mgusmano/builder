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
    const extensionUri: vscode.Uri = context.extensionUri;
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    if (SenchaCmdPanel.currentPanel) {
      SenchaCmdPanel.currentPanel._panel.reveal(column);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'SenchaCmdPanel',
      'SenchaCmdPanel',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true
      });
    SenchaCmdPanel.currentPanel = new SenchaCmdPanel(panel, extensionUri, context);
  }

  private constructor(webviewPanel: vscode.WebviewPanel, extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    this._panel = webviewPanel;
    this._context = context;
    this._extensionUri = extensionUri;
    const webview = this._panel.webview;
    this._panel.title = 'SenchaCmdPanel';
    this._panel.webview.html = this._getHtmlForWebview(webview);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this.messagesFromVSCode(this._panel);
    this.messagesFromWebview(this._panel, context);

  }

  public messagesFromVSCode = (webviewPanel: vscode.WebviewPanel) => {
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

  public messagesFromWebview = (webviewPanel: vscode.WebviewPanel, context: vscode.ExtensionContext) => {

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
    const toolkitUri = Utilities.getUri(webview, this._extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js",
    ]);
    var s = `<!DOCTYPE html>
  <html style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;">
    <head>
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10, user-scalable=yes">
      <script type="module" src="${toolkitUri}"></script>
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
      label {
        font-size: 1rem;
        padding-right: 10px;
      }     
      vscode-text-field {
        width: 350px;
      }
      vscode-dropdown:invalid,vscode-text-field:invalid{
        border: 1px solid red;
      }
  
      .select-container{
        margin-bottom: 30px;
      }
      .content{
        font-size: 18px;
        text-align: center;
        margin: auto;
        margin-bottom: 30px;
      }
      .button {
        background-color: #2196f3;
        padding: 7px 10px 9px;
        border-radius: 3px;
        margin: 4px 2px;
        width: 10%;
      }
      .fixed-footer,.fixed-header{
        width: 100%;
        padding: 10px 0;
        background-color: #f3f3f3; 
      }
      .fixed-header{
        height:70px;
      }
      .fixed-footer{
        bottom: 0;
      } 
      p{
        text-align: start;
        color: gray;
        font-size: 12px;
        margin-left: 36%;
      }

      html,body {
        margin:0;
        padding:0;
        height: 100%;
        overflow: scroll;
      }
      .header{
        font-size: 24px;
        text-align: center;
        margin: auto;
        margin-bottom: 13px;
      }
      .sub-header{
        font-size: 18px;
        text-align: center;
        margin-bottom: 32px;
      }
      .img{
        height: 90px;
        background-image: url('${sencha}');
        background-repeat: no-repeat;
        position: relative;
        background-position: center;
        background-size: auto 100%;
      }
      .header-content{
        align-items: center;
        overflow: hidden;
        margin: auto;
        display: flex;
        background-color: #ffff;
        height: 5vh;
      }
      .header-topic{
        opacity: 0.81;
        font-size: 17px;
        color: #5f5858;
        margin-left: 10px;
      }
      .ext-folder{
        font-family: Roboto, sans-serif;
        border-radius: 3px;
        display: flex;
        margin: 9px 2px;
        width: 16%;
      }
      .vscode-text-label{
        display: flex;
        justify-content: space-around;
        margin-right: 19%;
        cursor: pointer;
        color: var(--input-placeholder-foreground);
        font-size: var(--type-ramp-base-font-size);
        line-height: var(--type-ramp-base-line-height);
        margin-bottom: calc(var(--design-unit) * 2px);
      }
      </style>
    </head>
    <body id='extbody' align="center">
      <div class="fixed-header">
        <div class="header-content">
        <div class="header-topic">Sencha Builder</div>
        </div>
        <vscode-button class="ext-folder" onclick="onOpen()">OPEN NEW EXTJS FOLDER</vscode-button>
      </div>
      <div style="color: black; background-color: white;">
        <div class="img"></div>
        <div class="header">Create a New Application</div>
        <div class="sub-header">Use this form to create a new Sencha Ext JS Application</div>
        <form name="RegForm" method="post">
          <div class="select-container">
            <p>Toolkit*</p>
            <vscode-dropdown style="width:350px; color: gray;" name="toolkit" required>
            	<vscode-option value="" selected>Select a toolkit...</vscode-option>
            	<vscode-option value="modern">modern</vscode-option>
            	<vscode-option value="classic">classic</vscode-option>
            </vscode-dropdown>
          </div>
          <div class="select-container">
            <p>Theme*</p>
            <vscode-dropdown style="width:350px; color: gray;" name="theme" required>
              <vscode-option value="" selected>Select a theme...</vscode-option>
            	<vscode-option value="material">material</vscode-option>
            	<vscode-option value="ios">ios</vscode-option>
              <vscode-option value="triton">triton</vscode-option>
            </vscode-dropdown>
          </div>
          <div class="select-container">
            <label class="vscode-text-label">Application Name*</label>
            <vscode-text-field value="" name="ApplicationName" placeholder="Application Name" required></vscode-text-field>
          </div>
          <div class="select-container">
            <label class="vscode-text-label">Application Path*</label>
            <vscode-text-field class="select-container value="${os.homedir()}/SenchaApps" name="ApplicationPath" placeholder="Application Path" required></vscode-text-field>
          </div>
          <div class="content">When you click the Submit button,<br> a terminal window will start and Sencha Cmd will run.</div>
          <div class="fixed-footer">
            <vscode-button class="button" onclick ="validateForm()">SUBMIT</vscode-button>
          </div>
        </form>
      </div>
      <script>
        function validateForm(){
         if(document.forms["RegForm"].checkValidity()){
          vscode.postMessage({
            command: 'runcmd',
            toolkit: document.forms["RegForm"]["toolkit"].value,
            theme: document.forms["RegForm"]["theme"].value,
            applicationName: document.forms["RegForm"]["ApplicationName"].value,
            applicationPath: document.forms["RegForm"]["ApplicationPath"].value
          });
          }
        }
        function onOpen(){
          vscode.postMessage({
            command: 'open'
          })
        }
      </script>

      <script>
        const vscode = acquireVsCodeApi();
      </script>
    </body>
  </html>`;
    return s;
  }

}