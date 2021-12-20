import * as vscode from 'vscode';
import * as os from 'os';
const fs = require('fs');
import { Utilities } from "../Utilities";
import { SenchaCmdPanelHTML } from "./SenchaCmdPanelHtml";
import { spawn } from 'child_process';

export class SenchaCmdPanel {
  public _context: vscode.ExtensionContext;
  private readonly _extensionUri: vscode.Uri;
  public static currentPanel: SenchaCmdPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  public _toolkit: any;
  public _version:any;
  public _theme: any;
  public _applicationName: any;
  public _applicationPath: any;
  private mainViewFileContents = `Ext.define('myApp.view.MainView', {
    extend: 'Ext.grid.Panel',
    xtype: 'simpleview',
    title: 'Title1',
    width: '100%',
    height: '100%',
    store: {
        fields: [
            'name',
            'email',
            'phone'
        ],
        data: [
            {
                name: 'Lisa1',
                email: 'lisa@simpsons.com',
                phone: '555-111-1224'
            },
            {
                name: 'Bart',
                email: 'bart@simpsons.com',
                phone: '555-222-1234'
            },
            {
                name: 'Homer',
                email: 'homer@simpsons.com',
                phone: '555-222-1244'
            },
            {
                name: 'Marge',
                email: 'marge@simpsons.com',
                phone: '555-222-1254'
            }
        ]
    },
    columns: [
        {
            text: 'Phone No',
            dataIndex: 'phone',
        },
        {
            text: 'Email',
            dataIndex: 'email'
        },
        {
            text: 'name',
            dataIndex: 'name'
        }
    ]
});`;
private testFileContents = `descibe("test", () => {
    it("Should run", () => {
        expect(1).toBe(1);
    });
});`;

private PanelViewContents = `Ext.define('myApp.view.MainPanelView', {
  extend: 'Ext.panel.Panel',
  title: 'Form Panel Test',
  width: '100%',
  height: '100%',
});`;
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

    webviewPanel.webview.onDidReceiveMessage(async (message) => {
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

          vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            cancellable: false,
            title: `Generating app.`
          }, async (progress) => {
            let pseudoProgress = 0;
            progress.report({ increment: 0 });
            // Fake progress bar code.
            const timer = setInterval(() => {
              if (pseudoProgress < 80) {
                progress.report({
                  increment: Math.floor(Math.random() * (10 - 1) + 1)
                });
              } else { clearInterval(timer); };
            }, 1000);
            const code = await this.generateApp(message);
            if (code !== 0) {
              vscode.window.showErrorMessage("Unable to generate app.");
            } else {
              await this.modifyGeneratedApp(`${message.applicationPath}/${message.applicationName}`);
              vscode.window.showInformationMessage("App generated successfully.");
            }
            progress.report({ increment: 100 });
          });

          this._toolkit = message.toolkit;
          this._theme = message.theme;
          this._applicationName = message.applicationName;
          this._applicationPath = message.applicationPath;
          this._version = message.version;
          break;
      }
    });
  };

  /**
   * @description Modifies the generated application and adds custom files.
   * @param path string The path of the newly created application.
   */
  private modifyGeneratedApp(path: string) {
    try {
      fs.writeFileSync(`${path}/app/view/main/MainView.js`, this.mainViewFileContents, "utf-8");
      fs.mkdirSync(`${path}/app/test`);
      fs.writeFileSync(`${path}/app/test/test.js`, this.testFileContents, "utf-8");
      fs.writeFileSync(`${path}/app/view/main/MainView.scss`, "", "utf-8");
      fs.writeFileSync(`${path}/app/view/main/MainPanelView.js`,this.PanelViewContents, "utf-8");
    } catch (er: any) {
      vscode.window.showErrorMessage(er.message);
    }
  }

  /**
   * @description Launches the sencha cmd process and writes the output to
   * the vscode output channel "sencha".
   * @param message webview message object.
   * @returns Promise execution code.
   */
  private generateApp(message: any) {
    const args = [
      'generate',
      "app",
      `--ext@${message.version}`,
      `-${message.toolkit}`,
      `--theme-name`,
      `theme-${message.theme}`,
      `${message.applicationName}`,
      `${message.applicationPath}/${message.applicationName}`];
    const appGen = spawn("sencha", args, {
      stdio: ['pipe', 'pipe', 'inherit'],
      shell: true
    });
    let sencha = vscode.window.createOutputChannel("Sencha");
    sencha.show();
    appGen.stdout.setEncoding('utf8');
    appGen.stdout.on('data', function (data) {
      data = data.toString();
      sencha.append(data);
    });
        
    return new Promise((resolve, reject) => {
      appGen.on("close", code => {
        sencha.append('Done!');
        return resolve(code);
      })
        .on("error", err => {
          return reject(err);
        });
    });
  }

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
      .body-container{
        background-color: #35284b;
        background-image: linear-gradient(56deg, #6a3e73 0%, #25193a 73%);
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
        margin-bottom: 20px;
      }
      .content{
        font-size: 12px;
        text-align: start;
        margin: auto;
        font-weight: 600;
        color: var(--input-placeholder-foreground);
        margin-bottom: 15px;
        margin-left: 12%;
        width: 80%;
      }
      .button {
        background-color: #1d893e;
        border-radius: 3px;
        margin: -3px 2px;
        width: 72%;
      }
      p{
        text-align: start;
        font-size: 12px;
        margin-left: 12%;
        color: var(--input-placeholder-foreground);
      }
      .header{
        font-size: 21px;
        text-align: start;
        font-weight: 600;
        color: var(--input-placeholder-foreground);
        margin-bottom: 7px;
        margin-left: 11.5%;
      }
      .sub-header{
        font-size: 14px;
        text-align: center;
        font-weight: 600;
        color: var(--input-placeholder-foreground);
        margin-bottom: 20px;
      }
      .img{
        height: 90px;
        background-image: url('${sencha}');
        background-repeat: no-repeat;
        position: relative;
        background-position: center;
        background-size: auto 80%;
        margin-top: 45%;
      }
      .ext-folder{
        font-family: Roboto, sans-serif;
        background-color: #1d893e;
        border-radius: 3px;
        margin: 14px 25px;
        width: 83%;
        display: flex;
      }
      .vscode-text-label{
        display: flex;
        justify-content: flex-start;
        margin-left: 12%;
        cursor: pointer;
        color: var(--input-placeholder-foreground);
        font-size: 12px;
        line-height: var(--type-ramp-base-line-height);
        margin-bottom: calc(var(--design-unit) * 2px);
      }
      .split-left{
        width: 25%;
        height: 89.3%;
        position: fixed;
        margin: 3.2rem auto 0 auto;
        background-color: var(--vscode-sideBar-background);
        left: 19%;
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
      }
      .split-right{
        width: 37%;
        height: 86%;
        overflow-y: auto;
        padding-top: 20px;
        position: fixed;
        margin: 3.2rem auto 0 auto;
        background-color: var(--vscode-editor-background);
        right: 19%;
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
      }
      ::-webkit-scrollbar {
        width: 0; 
        background: transparent;  
      }

      </style>
    </head>
    <body id='extbody' class="body-container" align="center">
      <div>
        <div class="split-left">
          <vscode-button class="ext-folder" onclick="onOpen()">OPEN NEW EXTJS FOLDER</vscode-button>
          <div class="img"></div>
        </div>
        <div class="split-right">
          <div class="header">Create a New Application</div>
          <div class="sub-header">Use this form to create a new Sencha Ext JS Application</div>
          <form name="RegForm" method="post">
            <div class="select-container">
                <label class="vscode-text-label">Application Name*</label>
                <vscode-text-field value="" name="ApplicationName" placeholder="Enter Application Name" required></vscode-text-field>
            </div>
            <div class="select-container">
                <label class="vscode-text-label">Application Path*</label>
                <vscode-text-field value="${os.homedir()}/SenchaApps" name="ApplicationPath" placeholder="Enter Application Path" required></vscode-text-field>
            </div>
            <div class="select-container">
              <p>Toolkit*</p>
              <vscode-dropdown style="width:350px; color: var(--input-placeholder-foreground);" onchange="onToolkitChange();" id="toolkit" required>
            	  <vscode-option value="" selected>Select a toolkit...</vscode-option>
            	  <vscode-option value="modern">modern</vscode-option>
            	  <vscode-option value="classic">classic</vscode-option>
              </vscode-dropdown>
            </div>
            <div class="select-container">
              <p>Theme*</p>
              <vscode-dropdown style="width:350px; color: var(--input-placeholder-foreground);" name="theme" required>
                <vscode-option value="" selected>Select a theme...</vscode-option>
            	  <vscode-option value="material">material</vscode-option>
            	  <vscode-option value="ios">ios</vscode-option>
                <vscode-option value="triton">triton</vscode-option>
              </vscode-dropdown>
            </div>
            <div class="select-container">
              <p>Templates*</p>
              <vscode-dropdown style="width:350px; color: var(--input-placeholder-foreground);" id="template" name="template" required>
                <vscode-option value="" selected>Select a Templates...</vscode-option>
              </vscode-dropdown>
            </div>
            <div class="select-container">
              <p>Version*</p>
              <vscode-dropdown style="width:350px; color: var(--input-placeholder-foreground);" onchange="versionSelection();" id="version" required>
              <vscode-option value="" selected>Select a version...</vscode-option>
            </div>
            <div class="content">On click of Submit button a terminal window will start and Sencha Cmd will run.</div>
            <vscode-button class="button" onclick ="validateForm()">SUBMIT</vscode-button>
          </form>
        </div>
      </div>
      <script>
        var select = document.getElementById("version");
        var options = ["7.4.0", "7.3.1", "7.3.0", "7.2.0", "7.1.0","7.0.0","7.0.0-CE","6.7.0","6.7.0-CE","6.6.0-CE","6.6.0","6.5.3","6.5.2","6.5.1","6.5.0","6.2.1","6.2.0","6.0.2","6.0.2","6.0.1","6.0.0","5.1.4","5.1.3","5.1.2","5.1.1","5.1.0","5.0.1","5.0.0","4.2.6","4.1.3","4.0.7","3.4.0"];
        var template = document.getElementById("template");
        var templateOptions = ["Login Form","Grid","Chart","Dashboard"];
        function versionSelection(){
          if(select.value){
            return true;
          }
          return false;
        }

        function onToolkitChange(){
          var arr = options.slice(0);
          var arrTemplate = templateOptions.slice(0);
          if(document.getElementById('toolkit').value == "modern"){
            arr = options.slice(0,21);
            arrTemplate = templateOptions.slice(0,3);
          } 

          for( var k = 0; k < select.childNodes.length;) {
            select.removeChild(select.childNodes[k]);
          }
          for(var i = 0; i < arr.length; i++) {
            var opt = arr[i];
            var el = document.createElement("vscode-option");
            el.textContent = opt;
            el.value = opt;
            select.appendChild(el);
          }
          for( var k = 0; k < template.childNodes.length;) {
            template.removeChild(template.childNodes[k]);
          }
          for(var i = 0; i < arrTemplate.length; i++) {
            var opt = arrTemplate[i];
            var el = document.createElement("vscode-option");
            el.textContent = opt;
            el.value = opt;
            template.appendChild(el);
          }
        }
        function validateForm(){
         if(document.forms["RegForm"].checkValidity()){
          vscode.postMessage({
            command: 'runcmd',
            toolkit: document.forms["RegForm"]["toolkit"].value,
            theme: document.forms["RegForm"]["theme"].value,
            version: document.forms["RegForm"]["version"].value,
            applicationName: document.forms["RegForm"]["ApplicationName"].value,
            applicationPath: document.forms["RegForm"]["ApplicationPath"].value,
            template: document.forms["RegForm"]["template"].value
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