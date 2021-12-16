import * as vscode from "vscode";
import { Utilities } from "../Utilities";
import { Logger } from "../Logger";
import * as esprima from "esprima";
import * as escodegen from "escodegen";
import axios from "axios";
import * as fs from 'fs';
import { getMainViewHtml } from "../webview/html/MainView";
import {gridTemplate} from '../webview/html/grid';

export class BasicTextEditorProvider implements vscode.CustomTextEditorProvider {
  public _context: vscode.ExtensionContext;
  private readonly _extensionUri: vscode.Uri;
  private webviewPanel: any;
  public _ast: any;
  public _props: any;
  public _document: any;
  public _extend: any;
  public _namespace: any;
  public _xtype: any;
  public _currrentAst: any;

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

  public getData = async (groupID: any) => {
    const apiRoot = 'https://skillnetusersapi.azurewebsites.net/api';
    //const localRoot = 'http://localhost:3005';
    const localRoot = 'https://my-json-server.typicode.com/mgusmano/toshibaserver';
    const auth = {auth:{username:'skillnet',password:'demo'}};

    const skills2Url = `${apiRoot}/PortalGroupSkillsOnly?groupid=${groupID}`;
    //console.log(skills2Url)
    const skills2Result = await axios(skills2Url,auth);
    const operators2Result = await axios(`${apiRoot}/PortalGroupOperators?groupid=${groupID}`,auth);
    const certifications2Result = await axios(`${apiRoot}/PortalCertificationsRating?groupid=${groupID}`,auth);

    // //just for the webAPI data while it is broken
    const skills3Resultdata = skills2Result.data.slice(0, 19);

    var r = {
      //skills: skills2Result.data,
      skills: skills3Resultdata,
      operators: operators2Result.data,
      certifications: certifications2Result.data
    };
    return r;
  };


  public async resolveCustomTextEditor( document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, _token: vscode.CancellationToken ): Promise<void> {
    this._document = document;
    this.webviewPanel = webviewPanel;
    webviewPanel.webview.options = { enableScripts: true, enableCommandUris: true, };
    var s = this.doPropsJSON(document.getText());
    const componetListUri = (vscode.Uri.joinPath(this._extensionUri, 'media','data','componentlist.json')).with({ 'scheme': 'vscode-resource' });
    const componentList = fs.readFileSync(`${componetListUri.path}`,{encoding:'utf8', flag:'r'});
    const componetTargetUri = (vscode.Uri.joinPath(this._extensionUri, 'media','data','componenttargets.json')).with({ 'scheme': 'vscode-resource' });
    const componetTarget = fs.readFileSync(`${componetTargetUri.path}`,{encoding:'utf8', flag:'r'});

    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, JSON.stringify(componentList),JSON.stringify(componetTarget));
    this.messagesFromExtension(webviewPanel);
    this.messagesFromWebview(webviewPanel);
  }

  public messagesFromExtension = (webviewPanel:vscode.WebviewPanel) => {
    this._context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(
        (e) => {
          //console.log("onDidSaveTextDocument in the extension");
          if (e.uri.toString() === this._document.uri.toString()) {
            this._ast = esprima.parseScript(this._document.getText());
            this.webviewPanel.webview.postMessage({
              type:'reloadView',
              code: this._document.getText(),
              ast:this._ast
            });
          }
        }
      )
    );
  };

  public messagesFromWebview = (webviewPanel:vscode.WebviewPanel) => {
    webviewPanel.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "updateCode":{
          this.updateCode(message.payload,message.location);
          break;
        }
        case "changeTitle":
          this._props[2].value.value = message.value;
          var code = escodegen.generate(this._ast);
          this.updateTextDocument(this._document,code);
          var s = this.doPropsJSON(code);
          webviewPanel.webview.postMessage({
            type: "documentchange",
            code: code,
            s: s
          });
          break;
        case "showCode":
          let uri = vscode.Uri.file(this._document.fileName);
          const opts: vscode.TextDocumentShowOptions = {
            preserveFocus: false,
            preview: true,
            viewColumn: vscode.ViewColumn.Beside
          };
          vscode.commands.executeCommand('vscode.openWith', uri, 'default', opts);
          break;
         case 'showConfig': {
           this.loadCompoentConfigs(message);
           break;
         }
         case 'updateConfigs':{
           this.updateCodeConfigs(message.payload);
         } 
      }
    });
  };

  private updateCodeConfigs(message: any){
    //const ast = esprima.parseScript(this._document.getText());
    //this._ast = ast;
    const properties = Array.isArray(this._currrentAst)?this._currrentAst:this._currrentAst.properties;
    let found = false;

    properties.forEach((item: any) => {
      if(item.key.name === message.name && item.value.type === 'ArrayExpression'){
          
          const config = this.getConfig(message, true);
          item.value = config.value;
          found = true;
      }
      else if(item.key.name === message.name){
        const config = this.getConfig(message, true);
        item.value = config.value;
        found = true;
      }
    });
    if(!found) {
      const config = this.getConfig(message, false);
      properties.push(config);
    }
    var code = escodegen.generate(this._ast);
    this.updateTextDocument(this._document,code);
  }

  private updateCode(message: any, lc: any[]) {
    this.locateObjectInAst(lc,message);
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
        const ast = this.getConfig1('array',location[i].propertyName);
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
         const ast = this.getConfig1('object','simple',message.defaultConfig);
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
  private getConfig1(type: string,property:string,value?: string){
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
  private loadCompoentConfigs(message: any) {
    const uri = (vscode.Uri.joinPath(this._extensionUri, 'media','data',`${message.payload.type}.json`)).with({ 'scheme': 'vscode-resource' });
    const data = fs.readFileSync(`${uri.path}`,{encoding:'utf8', flag:'r'});
    this.locateObjectInAst(message.location, undefined, false);
    const astMapperData = this.getAstMapperData();
    this.webviewPanel.webview.postMessage({
      type:'loadConfig',
      ast: astMapperData,
      payload: data
    });

  }

  private getAstMapperData(){
    const astValueMapper: any = {};
    const astProperties = Array.isArray(this._currrentAst) ? this._currrentAst : this._currrentAst.properties;
    for(var i=0;i< astProperties.length;i++){
      if(astProperties[i].value.type === 'ArrayExpression'){
        astValueMapper[astProperties[i].key.name || astProperties[i].key.value] = escodegen.generate(astProperties[i].value).replace(/(\r\n|\n|\r)/gm,"");
      }
      else{
        astValueMapper[astProperties[i].key.name || astProperties[i].key.value] = astProperties[i].value.value;
      }
      
    }
    return astValueMapper;
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
    //vscode.workspace.saveAll();
    this.webviewPanel.webview.postMessage({
      type:'reloadView',
      code: this._document.getText()
    });
    //vscode.workspace
  }

  public doPropsJSON(d: any) {
    this._ast = esprima.parseScript(d);
    this._props = this._ast.body[0].expression.arguments[1].properties;
    this._namespace = this._ast.body[0].expression.arguments[0].value;

    //var objectName = this._ast.body[0].expression.callee.object.name;
    //var propertyName = this._ast.body[0].expression.callee.property.name;
    //var p = objectName + '.' + propertyName + ', ' + this._ast.body[0].expression.arguments[0].value;

    // console.log('this is the ROOT AST:');
    // console.log(this._ast);
    // console.log('this is the AST structure:');
    // console.log(this._ast.body[0]);
    // console.log('this is the AST props:');
    // console.log(this._props);
    // console.log('this is the AST props value for title:');
    // console.log(this._props[2].value.value);

    var pArray: any[] = [];
    this._props.map((prop:any,i: any) => {
      if (prop.key.name === 'extend') {
        this._extend = prop.value.value;
      }
      if (prop.key.name === 'xtype') {
        this._xtype = prop.value.value;
      }

      var o: any = {};
      var val: any = [];
      if (prop.value.type === 'Literal') {
        val = prop.value.value;
      }
      else {
        //console.log(prop)
      }
      o.id = i;
      o.name = prop.key.name;
      o.value = val;
      pArray.push(o);
    });
    return pArray;
  }
  private getHtmlForWebview(webview: vscode.Webview, componentList: any, componentTargets:any): string {
    const modifiedUrl = vscode.Uri.joinPath(this._extensionUri,'src','webview','js','MainView.js').with({ 'scheme': 'vscode-resource' });
    const URLS = ['styles/style.css'] as Array<string>;
    const resourceUrls = this.getResourseUrl(URLS);
    const ast = JSON.stringify(this._ast);
    // Test
    // const extModernAll = (vscode.Uri.joinPath(this._extensionUri, 'media', 'ext-modern-all-debug.js')).with({ 'scheme': 'vscode-resource' });
    // const themeAll1 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'buildertheme-all-debug_1.css')).with({ 'scheme': 'vscode-resource' });
    // const themeAll2 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'buildertheme-all-debug_2.css')).with({ 'scheme': 'vscode-resource' });
    const toolkitUri = Utilities.getUri(webview, this._extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js",
    ]);
    const extModernAll = (vscode.Uri.joinPath(this._extensionUri, 'media', 'ext-all.js')).with({ 'scheme': 'vscode-resource' });
    // const themeAll1 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'theme-classic-all_1.css')).with({ 'scheme': 'vscode-resource' });
    // const themeAll2 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'theme-classic-all_2.css')).with({ 'scheme': 'vscode-resource' });
    const themeAll1 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'theme-material','resources','theme-material-all_1.css')).with({ 'scheme': 'vscode-resource' });
    const themeAll2 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'theme-material','resources','theme-material-all_2.css')).with({ 'scheme': 'vscode-resource' });
    const themeAll3 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'theme-material','resources','theme-material-all_3.css')).with({ 'scheme': 'vscode-resource' });
    const nonce = Utilities.getNonce();
    const codeText = this._document.getText();
		return `<!DOCTYPE html>
    <html style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;">
    <head>
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10, user-scalable=yes">
      ${resourceUrls}
      <script type="module" nonce="${nonce}" src="${toolkitUri}"></script>
      <script nonce="${nonce}" src="${extModernAll}"></script>
      <link href="${themeAll1}" rel="stylesheet">
      <link href="${themeAll2}" rel="stylesheet">
      <link href="${themeAll3}" rel="stylesheet">
      <title>ExtJSPanel</title>
      <body>
      ${getMainViewHtml()}
       <script>
       //document.domain = "localhost:1841";
       window.localStorage.setItem('componentList',${componentList});
       window.localStorage.setItem('componentTargets',${componentTargets});
       const vscode = acquireVsCodeApi();
       ${gridTemplate(codeText)}
       </script> 
       <script type="module">
        import {renderView} from '${modifiedUrl}';
        renderView(${ast});
       </script>
      </body>
    </html>`;

  }

  private getResourseUrl(relativeUrl: string[]) :string {
    
    const resourceURLS = [];
    for(let i=0; i< relativeUrl.length; i++) {
      relativeUrl[i] = `src/webview/${relativeUrl[i]}`;
      const urlParts = relativeUrl[i].split('/');
      const modifiedUrl = vscode.Uri.joinPath(this._extensionUri, ...urlParts).with({ 'scheme': 'vscode-resource' });
      const nonce = Utilities.getNonce();
      let tag = '';
      if(urlParts[2]=== 'styles') {
        tag = `<link rel="stylesheet" href="${modifiedUrl}">`;
      }
      else {
        tag = `<script type="module" nonce="${nonce}"  src="${modifiedUrl}"></script>`
      }
      resourceURLS.push(tag);
    }
    return resourceURLS.join(' ');
  }
  // private getHtmlForWebview(webview: vscode.Webview, s: any , c: any): string {
  //   const extModernAll = (vscode.Uri.joinPath(this._extensionUri, 'media', 'ext-modern-all-debug.js')).with({ 'scheme': 'vscode-resource' });
  //   const themeAll1 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'buildertheme-all-debug_1.css')).with({ 'scheme': 'vscode-resource' });
  //   const themeAll2 = (vscode.Uri.joinPath(this._extensionUri, 'media', 'buildertheme-all-debug_2.css')).with({ 'scheme': 'vscode-resource' });
  //   const nonce = Utilities.getNonce();
  //   debugger;
	// 	return `<!DOCTYPE html>
  //   <html style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;">
  //   <head>
  //     <meta http-equiv="X-UA-Compatible" content="IE=edge">
  //     <meta charset="UTF-8">
  //     <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10, user-scalable=yes">
  //     <title>ExtJSPanel</title>
  //     <script nonce="${nonce}" src="${extModernAll}"></script>
  //     <link href="${themeAll1}" rel="stylesheet">
  //     <link href="${themeAll2}" rel="stylesheet">
  //     <style>
  //     .x-panelheader-accordion {
  //       background-color: var(--vscode-editor-background);
  //     }
  //     </style>
  //   </head>
  //   <body id='extbody'></body>
  //   <script>
  //   Ext.onReady(function() {
  //     ${this._document.getText()}
  //     Ext.application({
  //       name: 'MyApp',
  //       launch: function() {
  //         console.log(document.getElementById('extbody'))
  //         Ext.Viewport.add({
  //           xtype: 'panel',
  //           style: "borderLeft:1px solid lightgray;borderTop:1px solid lightgray;borderRight:21px solid lightgray;borderBottom:1px solid lightgray;",
  //           border: true,
  //           layout: {type: 'fit',align: 'stretch'},
  //           defaultType: 'panel',
  //           items: [
  //             {
  //               docked:'top',height:30,bodyStyle:'background:whitesmoke;',
  //               resizable: {split:true,edges:'south'},
  //               items: [
  //                 {xtype:'component',html:'Sencha Builder',style:'marginTop:6px;marginLeft:15px;fontStyle:italic;'}
  //               ]
  //             },
  //             {
  //               docked:'bottom',height:30,bodyStyle:'background:whitesmoke;',
  //               resizable: {split:true,edges:'north'},
  //               items: [
  //                 {xtype:'component',html:'v20211111(a)',style:'marginTop:6px;marginLeft:15px;fontStyle:italic;'}
  //               ]
  //             },
  //             {
  //               docked: 'left',
  //               xstyle: 'width:5px;',
  //               minWidth: 250,
  //               resizable: {split:true,edges:'east'},
  //               items: [
  //                 {
  //                   xtype: 'dataview',id: 'dataview',padding: 10,
  //                   store: {data: ${s}},
  //                   itemTpl:
  //                     '<div style="display:flex;flex-direction:row;">' +
  //                       '<div style="width:100px;background:whitesmoke;border:1px solid lightgray;">{name}</div>' +
  //                       '<div style="flex:2;border:0px solid lightgray;">' +
  //                       '<input id="{id}" type="text" name="name" value="{value}" /></div>' +
  //                     '</div>'
  //                 },
  //                 {xtype: 'button', style:'marginLeft:10px;', text: 'Change Title',ui: 'action',handler:changeTitle},

  //                 //{xtype: 'container', html: '<iframe src="http://localhost:1841" title="description"></iframe>',margin: '30 10 0 0', padding: 10},

  //                 {xtype: 'container', html: 'aggable components',margin: '30 10 0 0', padding: 10},
  //                 {
  //                   xtype: 'dataview',id: 'dataviewdrag',padding: 10,margin: '0 0 0 0',
  //                   store: {data: ${c}},
  //                   itemTpl:
  //                     '<div class="dragcomp" style="padding:3px;width:130px;display:flex;flex-direction:row;" type="{type}" xtype="{xtype}" draggable="true">' +
  //                       '<div style="width:30px;" class="fa fa-{icon}"></div>' +
  //                       '<div type="{type}" style="flex:1">{xtype}</div>' +
  //                     '</div>'
  //                 },
  //               ],
  //             },
  //             {
  //               id: 'dynamicpanel', height: '100%',
  //               bodyStyle: 'background:white; padding:10px;',
  //               layout: {type: 'fit',align: 'stretch'},
  //               tbar: [
  //                 {text: 'Show Code',ui: 'action',handler:showCode}
  //               ],
  //               items: [
  //                 {xtype:'${this._xtype}',shadow:true}
  //               ]
  //             }
  //           ]
  //         });
  //       }
  //     });
  //   });
  //   </script>

  //   <script>
  //   const vscode = acquireVsCodeApi();

  //   function changeTitle() {
  //     var val = document.getElementById('2').value;
  //     vscode.postMessage({command: 'changeTitle', value: val})
  //   }

  //   function showCode() {
  //     console.log('showCode')
  //     vscode.postMessage({command: 'showCode'})
  //   }

  //   window.addEventListener('message', event => {
  //     console.log('we have a new message from the extension',event)
  //     const message = event.data;
  //     switch (message.type) {
  //       case 'documentchange':
  //         //console.log('in the case: documentchange from the extension')
  //         Ext.getCmp('dataview').setData(message.s)
  //         Ext.undefine('${this._namespace}')
  //         var head = document.getElementsByTagName('head')[0];
  //         var script = document.createElement("SCRIPT");
  //         script.text = message.code
  //         head.appendChild(script)
  //         Ext.getCmp('dynamicpanel').setItems({xtype:'${this._xtype}',shadow:true})
  //         break;
  //     }
  //   });
  //   </script>

  //   </html>`;
	// }
}






    //https://astexplorer.net/

    //https://code.visualstudio.com/api/references/commands
    //https://code.visualstudio.com/api/references/vscode-api
    //https://code.visualstudio.com/api/references/vscode-api#TextDocumentShowOptions
    //https://code.visualstudio.com/api/references/vscode-api#ViewColumn
    //https://vshaxe.github.io/vscode-extern/vscode/TextDocumentShowOptions.html
    //https://github.com/microsoft/vscode/issues/73595
    //https://code.visualstudio.com/docs/getstarted/userinterface#_side-by-side-editing


//   private getHtmlForWebview2( webview: vscode.Webview, p: any ): string {
//     return `<!DOCTYPE html>
//     <html style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;">
//     <head>
//       <meta charset="UTF-8">
//       <title>mjg</title>
//     </head>
//     <body style="width:100%;height:100%;margin:0;padding:0;overflow:hidden;display:flex;flex-direction:column;">
//       <div style="flex:1;border:5px solid red;background:lightgray;color:black;padding:10px;">
//         <button onclick="clickFunction()">Change the title property</button>
//         <div style="margin-top:10px;font-size:16px;">Displaying the Abstract Syntax Tree (AST)</div>
//         <div id="result">
//         <pre>
// ${p}
//         </pre>
//         </div>

//       </div>

//     </body>
//     <script>
//       const vscode = acquireVsCodeApi();
//       var b = document.getElementById('result');
//       function clickFunction() {
//         //b.innerHTML = b.innerHTML + 'button was clicked' + '<br/>'
//         vscode.postMessage({command: 'update'})
//       }

//       window.addEventListener('message', event => {
//         console.log('we have a new message',event)
//         const message = event.data; // The JSON data our extension sent
//         console.log(message)
//         switch (message.type) {
//           case 'documentchange':
//             console.log('in the case: documentchange from the extension')
//             //b.innerHTML  = 'documentchange from the extension' + '<br/>'
//             //b.innerHTML  = '<pre>' + message.p + '</pre><br/>'
//             message.s
//             break;
//         }
//       });

//     </script>
//     </html>`;
//   }

  // public doProps(d: any) {
  //   this._ast = esprima.parseScript(d);
  //   var objectName = this._ast.body[0].expression.callee.object.name;
  //   var propertyName = this._ast.body[0].expression.callee.property.name;

  //   this._namespace = this._ast.body[0].expression.arguments[0].value;
  //   this._props = this._ast.body[0].expression.arguments[1].properties;

  //   // console.log('this is the ROOT AST:');
  //   // console.log(this._ast);
  //   // console.log('this is the AST structure:');
  //   // console.log(this._ast.body[0]);
  //   // console.log('this is the AST props:');
  //   // console.log(this._props);
  //   // console.log('this is the AST props value for title:');
  //   // console.log(this._props[2].value.value);

  //   var p = '';
  //   this._props.map((prop:any) => {
  //     if (prop.key.name === 'extend') {
  //       this._extend = prop.value.value;
  //     }
  //     if (prop.key.name === 'xtype') {
  //       this._xtype = prop.value.value;
  //     }

  //     var val = '[]';
  //     if (prop.value.type === 'Literal') {
  //       val = prop.value.value;
  //     }
  //     p = p + prop.key.name + ', ' + val + '<br/>';
  //   });
  //   p = objectName + '.' + propertyName + ', ' + this._ast.body[0].expression.arguments[0].value + '<br/>' + p;
  //   return p;
  // }