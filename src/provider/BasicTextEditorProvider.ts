import * as vscode from "vscode";
import { Utilities } from "../Utilities";
import { Logger } from "../Logger";
import * as esprima from "esprima";
import * as escodegen from "escodegen";
import axios from "axios";
import * as fs from 'fs';
import * as path from 'path';
import { getMainViewHtml } from "../html/MainView";
import {gridTemplate} from '../html/grid';

export class BasicTextEditorProvider implements vscode.CustomTextEditorProvider {
  public _context: vscode.ExtensionContext;
  private readonly _extensionUri: vscode.Uri;
  private webviewPanel: any;
  public _ast: any;
  public _document: any;
  public _extend: any;
  public _namespace: any;
  public _xtype: any;
  public _currrentAst: any;
  public _appName: string = '';
  public _toolkit: string = '';
  public _componetInfo: any;
  public _filesLinks:any;

  public static register( context: vscode.ExtensionContext ): vscode.Disposable {
    const provider = new BasicTextEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider('builder.BasicTextEditor',provider);
    return providerRegistration;
  }

  constructor(private readonly context: vscode.ExtensionContext) {
    Logger.log(`${Logger.productName}: BasicTextEditorProvider constructor`);
    this._context = context;
    this._extensionUri = context.extensionUri;
  }

  public async resolveCustomTextEditor( document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, _token: vscode.CancellationToken ): Promise<void> {
    this._document = document;
    this.getExtFraworkLocation();
    
    this.loadRequiredDepenDencies();
    if(!this._toolkit){
      this._toolkit = 'modern';
    }
    
    this.webviewPanel = webviewPanel;
    webviewPanel.webview.options = { enableScripts: true, enableCommandUris: true, };
    const componentList = this.readFileSync('media','data',this._toolkit,'componentlist.json');
    const componetTarget = this.readFileSync('media','data',this._toolkit,'componenttargets.json');
    this._componetInfo = JSON.parse(componetTarget);
    const stringify = JSON.stringify;
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, stringify(componentList),stringify(componetTarget));
    this.messagesFromExtension(webviewPanel);
    this.messagesFromWebview(webviewPanel);
  }
  private getUri(location: string[]): vscode.Uri{
    return (vscode.Uri.joinPath(this._extensionUri, ...location)).with({ 'scheme': 'vscode-resource' });
  }

  private readFileSync(...pathArr: string[]): any{
    try {
      const resolvedPathName = path.resolve(this.getUri(pathArr).fsPath);
      return fs.readFileSync(`${resolvedPathName}`,{encoding:'utf8', flag:'r'});
    }
    catch(err){
      throw(err);
    }
  }

  private loadRequiredDepenDencies() :void {
    let dir: string[] = path.dirname(this._document.uri.path).split('/');
    let filePath = '';
    while(dir.length > 0){
      const dirName = path.resolve(dir.join('/'),'.cache');
      const isExist = fs.existsSync(dirName);
      if(isExist) {
        filePath = dirName;
        break;
      }
      dir.pop();
    }
    try {
      const appInfo = (fs.readFileSync(path.resolve(filePath+'/filelinks.json'), "utf-8") as string) || '';
      this._filesLinks= JSON.parse(appInfo);
    }
    catch(err) {
      throw(err);
    }
  }

  private getExtFraworkLocation(){
    let dir: string[] = path.dirname(this._document.uri.path).split('/');
    let appPath = '';
    while(dir.length > 0){
      const dirName = path.resolve(dir.join('/'),'app.json');
      const isExist = fs.existsSync(dirName);
      if(isExist) {
        appPath = dirName;
        break;
      }
      dir.pop();
    }

    if(!appPath) {
      return;
    }

    try {
      const appInfo = (fs.readFileSync(appPath, "utf-8") as string) || '';
      const parsedAppinfo = JSON.parse(appInfo);
      this._toolkit = parsedAppinfo.builds.desktop.toolkit;
      this._appName = parsedAppinfo.namespace;
    }
    catch(err) {
      throw(err);
    }
  }

  public messagesFromExtension = (webviewPanel:vscode.WebviewPanel) => {
    this._context.subscriptions.push( vscode.workspace.onDidSaveTextDocument((e) => {this.onDocumentSave(e)}));
  };

  private onDocumentSave(e: any) {
    if (e.uri.toString() === this._document.uri.toString()) {
      this._ast = esprima.parseScript(this._document.getText());
      this.webviewPanel.webview.postMessage({
        type:'reloadView',
        code: this._document.getText(),
        ast:this._ast
      });
    }
  }
  public messagesFromWebview = (webviewPanel:vscode.WebviewPanel) => {
    webviewPanel.webview.onDidReceiveMessage((message) => { this.onReceiveMessage(message) });
  };
  
  private onReceiveMessage(message: any):void {
    switch (message.command) {
      case "updateCode":{
        this.updateCode(message.payload,message.location);
        break;
      }
      case "showCode":
        this.showCode();
        break;
       case 'showConfig': {
         this.loadCompoentConfigs(message);
         break;
       }
       case 'updateConfigs':{
         this.updateCodeConfigs(message.payload);
         break;
       } 
       case 'updateFunctions':{
        this.updateFunctions(message.payload);
        break;
      }
    }
  }

  private loadCompoentConfigs(message: any) {
    this.locateObjectInAst(message.location, undefined, false);
    const xtypeName = this.getXtypeName(message.payload.type);
    const data = this.readFileSync('media','data',this._toolkit,`${xtypeName}.json`);
    const astMapperData = this.getAstMapperData();

    this.webviewPanel.webview.postMessage({
      type:'loadConfig',
      ast: astMapperData,
      payload: data
    });

  }
  
  private getXtypeName(type: string): string {
    const astProperties = Array.isArray(this._currrentAst) ? this._currrentAst : this._currrentAst.properties;
    let xtype;
    for(var i=0;i< astProperties.length;i++){
      const property = astProperties[i];
      if(property.key.name ==='xtype' ||  property.key.value ==='xtype') {
        xtype = property.value.value;
        break;
      }
    }
    if(!xtype){
      return type;
    }

    if(xtype!==type && this._componetInfo[xtype]){
      return xtype;
    }
    return type;
  }
  private getAstMapperData(){
    const astValueMapper: any = {};
    const astProperties = Array.isArray(this._currrentAst) ? this._currrentAst : this._currrentAst.properties;
    for(var i=0;i< astProperties.length;i++){
      const property = astProperties[i];
      if(property.value.type === 'ArrayExpression'){
        astValueMapper[property.key.name || property.key.value] = escodegen.generate(property.value).replace(/(\r\n|\n|\r)/gm,"");
      }
      else if(property.value.type === 'ObjectExpression'){
        const object: any = {};
        for(var j=0;j< property.value.properties.length;j++){
          const prop = property.value.properties[j];
          if(!prop.key) {
            return;
          }
           object[prop.key.name || prop.key.value] = prop.value.value
        }
        astValueMapper[property.key.name || property.key.value] = object;
      }
      else if(property.value.type === 'FunctionExpression'){
        astValueMapper[property.key.name || property.key.value] = property.value;
      }
      else {
        astValueMapper[property.key.name || property.key.value] = property.value.value;
      }
      
    }
    return astValueMapper;
  }

  private showCode() {
    let uri = vscode.Uri.file(this._document.fileName);
    const opts: vscode.TextDocumentShowOptions = {
      preserveFocus: false,
      preview: true,
      viewColumn: vscode.ViewColumn.Beside
    };
    let openedEditors = vscode.window.visibleTextEditors;
    let isEditorOpened = false;

    for (var i = 0; i < openedEditors.length; i ++) {
      if (openedEditors[i].document.fileName === uri.path) {
        isEditorOpened = true;
        break;
      }
    }
      
    // Restrict opening the editor for multiple times
    if (!isEditorOpened) {
      vscode.commands.executeCommand('vscode.openWith', uri, 'default', opts);
    }
  }
  private updateCodeConfigs(message: any){
    const properties = Array.isArray(this._currrentAst)?this._currrentAst:this._currrentAst.properties;
    let found = false;
    let astProperty;
    for(let i=0;i<properties.length;i++){
      const item = properties[i];
      if(item.key.name === message.name){ 
        astProperty = item;
        found = true;
        break;
      }
    }

    if(!found) {
      const config = this.getConfig(message, false);
      properties.push(config);
    }
    else {
      const config = this.getConfig(message, true);
      astProperty.value = config.value;
    }
    var code = escodegen.generate(this._ast);
    if(!message.skipCodeUpdate){
      this.updateTextDocument(this._document,code);
    }
  }

  private updateCode(message: any, lc: any[]) {
    this.locateObjectInAst(lc,message);
  }

  private updateFunctions(message: any){
    const astProperties = message.currentView ? this._currrentAst.properties : this._ast.body[0].expression.arguments[1].properties;
    if(message.remove){
      const functionIdx = astProperties.findIndex((property: any) => property.key.name === message.name);
      if(functionIdx > -1){
        astProperties.splice(functionIdx, 1);
      }
    }else{
      const config = this.getConfig(message, false);
      const foundProperty = astProperties.find((property: any) => property.key.name === message.name);
      if(foundProperty){
        foundProperty.value = config.value;
      }else{
        astProperties.push(config);
      }
    }
    
    const code = escodegen.generate(this._ast);
    this.updateTextDocument(this._document,code);
  }

  private getConfig(config: any, flag: boolean){
    let configStr;
    if(!flag && config.type==='Array'){
      configStr = `
        var obj = {
          ${config.name}:[${JSON.stringify(config.defaultConfig)}]
        }
      `;
      const script1 = esprima.parseScript(configStr) as any;
      return script1.body[0].declarations[0].init.properties[0];
    }
    else if(flag && config.type==='Array'){
      configStr = `
        var obj = ${JSON.stringify(config.defaultConfig)}
      `;
      const script2 = esprima.parseScript(configStr) as any;
      console.log("console.log(script2)",script2);
      return script2.body[0].declarations[0].init;
    }
    else if(config.type==='Object'){
      configStr = `
        var obj = {
          ${config.name}:${JSON.stringify(config.defaultConfig)}
        }
      `;
      const script1 = esprima.parseScript(configStr) as any;
      return script1.body[0].declarations[0].init.properties[0];
    }
    else if(config.type==='Function'){
      configStr = `
        var obj = {${config.name}:function(${config.defaultConfig.join(',')}){}}
      `;
      const script2 = esprima.parseScript(configStr) as any;
      return script2.body[0].declarations[0].init.properties[0];
    }
    else {
      configStr = `
        var obj = {${config.name}:${JSON.stringify(config.defaultConfig)}}
      `;
      const script2 = esprima.parseScript(configStr) as any;
      console.log("console.log(script2)",script2)
      return script2.body[0].declarations[0].init.properties[0];
    }
    
  }

  private locateObjectInAst(location: any[],message?: any,codeUpdate: boolean=true){
    location.shift();
    let ast:  any = esprima.parseScript(this._document.getText());
    this._ast = ast;
    this._currrentAst = (ast as any).body[0].expression.arguments[1];
    for (let i=0;i<location.length;i++){
      if(location[i].dataType==='Array') {
        let found = false;
        this._currrentAst.properties.forEach((item:any) => {
          if(item.key.name === location[i].propertyName || item.key.value === location[i].propertyName){
            found = true;
            if(item.value.type==='ArrayExpression'){
              this._currrentAst = item.value.elements;
            }
          }
       });

       if(!found){
        const ast = this.getComponentConfig('array',location[i].propertyName);
        this._currrentAst.properties.push(ast);
        this._currrentAst = ast.value.elements;
       }
      }
      else {
        if(location[i].index!==undefined){
          if(this._currrentAst[location[i].index]){
            this._currrentAst = this._currrentAst[location[i].index];
          }
          else if(this._currrentAst && this._currrentAst[0]){
            this._currrentAst = this._currrentAst[0];
          }
        }
        else {
         const ast = this.getComponentConfig('object','simple',message.defaultConfig);
         if(this._currrentAst.properties){
          this._currrentAst.properties.push(ast);
         }
         else{
          this._currrentAst.push(ast);
         }
        }
      }
    }
    if(codeUpdate){
      var code = escodegen.generate(ast);
      this.updateTextDocument(this._document,code);
    }
  }
  
  private getComponentConfig(type: string,property:string,value?: string){
    let configStr;
    if(type==='array'){
        if(value){
          configStr = `
          var obj = {
            ${property}:[${JSON.stringify(value)}]
          }
        `;
        }
        else{
          configStr = `
          var obj = {
            ${property}:[]
          }
        `;
        }
      const script = esprima.parseScript(configStr) as any;
      return script.body[0].declarations[0].init.properties[0];
    }
    else if(type==='object'){
        configStr = `
        var obj = {
          ${property}:${JSON.stringify(value)}
        }
      `;
      const script1 = esprima.parseScript(configStr) as any;
      return script1.body[0].declarations[0].init.properties[0].value;
    }
    
  }

  

  private async updateTextDocument(document: vscode.TextDocument, code: any) {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
        document.uri,
        new vscode.Range(0, 0, document.lineCount, 0),
        code
    );
    vscode.workspace.applyEdit(edit);
    await vscode.workspace.fs.writeFile(document.uri,new TextEncoder().encode(this._document.getText()));
    this.webviewPanel.webview.postMessage({
      type:'reloadView',
      code: this._document.getText()
    });
  }

  private getHtmlForWebview(webview: vscode.Webview, componentList: any, componentTargets:any): string {
    const extAppFiles = this.getExtAppScriptFiles();
    const modifiedUrl = vscode.Uri.joinPath(this._extensionUri,'webview','js','MainView.js').with({ 'scheme': 'vscode-resource' });
    const toolkitUri = Utilities.getUri(webview, this._extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js",
    ]);
    const styles = ['webview/styles/style.css'] as Array<string>;
    const scripts = [] as Array<string>;
    if(this._toolkit === 'classic'){
      styles.push(
        "media/theme-material/resources/theme-material-all_1.css",
        "media/theme-material/resources/theme-material-all_2.css",
        "media/theme-material/resources/theme-material-all_3.css"
        );
        scripts.push("media/ext-all.js");
    }
    else if(this._toolkit === 'modern'){
      styles.push(
        "media/buildertheme-all-debug_1.css",
        "media/buildertheme-all-debug_2.css",
        "media/charts-modern-all.css",
        );
        scripts.push(
          "media/ext-modern-all-debug.js",
          "media/charts-modern.js"
        );
    }
    const resourceUrls = this.getResourseUrl(styles,'css');
    const scriptTags = this.getResourseUrl(scripts);
    const nonce = Utilities.getNonce();
    const codeText = this._document.getText();

		return `<!DOCTYPE html>
    <html style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;">
    <head>
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10, user-scalable=yes">
      ${resourceUrls}
      ${scriptTags}
      ${extAppFiles}
      <script type="module" nonce="${nonce}" src="${toolkitUri}"></script>
      <title>ExtJSPanel</title>
      <body>
      ${getMainViewHtml()}
       <script>
       //document.domain = "localhost:1841";
       window.localStorage.setItem('componentList',${componentList});
       window.localStorage.setItem('componentTargets',${componentTargets});
       window.localStorage.setItem('toolkit','${this._toolkit}');
       const vscode = acquireVsCodeApi();
       ${gridTemplate(codeText)}
       </script> 
       <script type="module">
        import {renderView} from '${modifiedUrl}';
        renderView(${JSON.stringify(this._ast)});
       </script>
      </body>
    </html>`;

  }

  getExtAppScriptFiles() :string[]|undefined {
    let scriptsLink:any = [];
    const nonce = Utilities.getNonce();
    if(!this._filesLinks){
      return ;
    }
    const files = Array.prototype.concat(...Object.values(this._filesLinks)) || [];
    for(let i=0;i<files.length;i++){
      if(!files[i].includes('Application.js')){
        const modifiedUrl = vscode.Uri.parse(files[i]).with({ 'scheme': 'vscode-resource' });
        scriptsLink.push(`<script nonce="${nonce}" src="${modifiedUrl}"></script>`);
      }
    }
    return scriptsLink;
  }

  private getResourseUrl(relativeUrl: string[], type: string = 'script'):string{
    const resourceURLS = [];
    const nonce = Utilities.getNonce();
    for(let i=0; i< relativeUrl.length; i++) {
      relativeUrl[i] = `${relativeUrl[i]}`;
      const urlParts = relativeUrl[i].split('/');
      const modifiedUrl = this.getUri(urlParts);
      let tag = '';
      if(type === 'css') {
        tag = `<link rel="stylesheet" href="${modifiedUrl}">`;
      }
      else {
        tag = `<script nonce="${nonce}"  src="${modifiedUrl}"></script>`
      }
      resourceURLS.push(tag);
    }

    return resourceURLS.join(' ');
  }
}