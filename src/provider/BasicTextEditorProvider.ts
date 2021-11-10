import * as vscode from "vscode";
import { Utilities } from "../Utilities";
import { Logger } from "../Logger";
import * as esprima from "esprima";
import * as escodegen from "escodegen";

export class BasicTextEditorProvider implements vscode.CustomTextEditorProvider {
  public _context: vscode.ExtensionContext;
  private readonly _extensionUri: vscode.Uri;
  public _ast: any;
  public _props: any;
  public _document: any;
  public _extend: any;
  public _namespace: any;
  public _xtype: any;

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
    webviewPanel.webview.options = { enableScripts: true, enableCommandUris: true, };
    var s = this.doPropsJSON(document.getText());

    var c = [
      { xtype: 'column',         type: 'grid',   icon: 'table'},
      { xtype: 'datecolumn',     type: 'grid',   icon: 'table'},
      { xtype: 'numbercolumn',   type: 'grid',   icon: 'table'},
      { xtype: 'treecolumn',     type: 'grid',   icon: 'table'},
      { xtype: 'button',         type: 'button', icon: 'cog'},
      { xtype: 'textfield',      type: 'form',   icon: 'th-list'},
      { xtype: 'colorfield',     type: 'form',   icon: 'th-list'},
      { xtype: 'checkboxfield',  type: 'form',   icon: 'th-list'},
      { xtype: 'comboboxfield',  type: 'form',   icon: 'th-list'},
      { xtype: 'containerfield', type: 'form',   icon: 'th-list'},
      { xtype: 'datefield',      type: 'form',   icon: 'th-list'},
      { xtype: 'emailfield',     type: 'form',   icon: 'th-list'},
      { xtype: 'inputfield',     type: 'form',   icon: 'th-list'},
      { xtype: 'numberfield',    type: 'form',   icon: 'th-list'},
      { xtype: 'passwordfield',  type: 'form',   icon: 'th-list'},
    ];

    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, JSON.stringify(s), JSON.stringify(c));
    this.messagesFromExtension(webviewPanel);
    this.messagesFromWebview(webviewPanel);
  }

  public messagesFromExtension = (webviewPanel:vscode.WebviewPanel) => {
    this._context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(
        (e) => {
          //console.log("onDidSaveTextDocument in the extension");
          if (e.uri.toString() === this._document.uri.toString()) {
            //console.log("post update message to webview");
            //console.log("*** this text");
            //console.log(e.document.getText());
            //console.log("*** this text");
            //console.log(webviewPanel.webview);
            //console.log(e.getText());
            var s = this.doPropsJSON(e.getText());
            webviewPanel.webview.postMessage({
              type: "documentchange",
              code: e.getText(),
              s: s
            });
          }
        }
      )
    );
  };

  public messagesFromWebview = (webviewPanel:vscode.WebviewPanel) => {
    webviewPanel.webview.onDidReceiveMessage((message) => {
      //console.log(message);
      switch (message.command) {
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
      }
    });
  };

  private updateTextDocument(document: vscode.TextDocument, code: any) {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
        document.uri,
        new vscode.Range(0, 0, document.lineCount, 0),
        code
    );
    return vscode.workspace.applyEdit(edit);
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

  private getHtmlForWebview(webview: vscode.Webview, s: any , c: any): string {
    const extModernAll = (vscode.Uri.joinPath(this._extensionUri, 'media', 'ext-modern-all-debug.js')).with({ 'scheme': 'vscode-resource' });
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
        background-color: var(--vscode-editor-background);
      }
      </style>
    </head>
    <body id='extbody'></body>
    <script>
    Ext.onReady(function() {
      ${this._document.getText()}
      Ext.application({
        name: 'MyApp',
        launch: function() {
          console.log(document.getElementById('extbody'))
          Ext.Viewport.add({
            xtype: 'panel',
            style: "borderLeft:1px solid lightgray;borderTop:1px solid lightgray;borderRight:21px solid lightgray;borderBottom:1px solid lightgray;",
            border: true,
            layout: {type: 'fit',align: 'stretch'},
            defaultType: 'panel',
            items: [
              {
                docked:'top',height:30,bodyStyle:'background:whitesmoke;',
                resizable: {split:true,edges:'south'},
                items: [
                  {xtype:'component',html:'Sencha Builder',style:'marginTop:6px;marginLeft:15px;fontStyle:italic;'}
                ]
              },
              {
                docked:'bottom',height:30,bodyStyle:'background:whitesmoke;',
                resizable: {split:true,edges:'north'},
                items: [
                  {xtype:'component',html:'v20211110(a)',style:'marginTop:6px;marginLeft:15px;fontStyle:italic;'}
                ]
              },
              {
                docked: 'left',
                xstyle: 'width:5px;',
                minWidth: 250,
                resizable: {split:true,edges:'east'},
                items: [
                  {
                    xtype: 'dataview',id: 'dataview',padding: 10,
                    store: {data: ${s}},
                    itemTpl:
                      '<div style="display:flex;flex-direction:row;">' +
                        '<div style="width:100px;background:whitesmoke;border:1px solid lightgray;">{name}</div>' +
                        '<div style="flex:2;border:0px solid lightgray;">' +
                        '<input id="{id}" type="text" name="name" value="{value}" /></div>' +
                      '</div>'
                  },
                  {xtype: 'button', style:'marginLeft:10px;', text: 'Change Title',ui: 'action',handler:changeTitle},
                  {xtype: 'container', html: 'draggable components',margin: '30 10 0 0', padding: 10},
                  {
                    xtype: 'dataview',id: 'dataviewdrag',padding: 10,margin: '0 0 0 0',
                    store: {data: ${c}},
                    itemTpl:
                      '<div class="dragcomp" style="padding:3px;width:130px;display:flex;flex-direction:row;" type="{type}" xtype="{xtype}" draggable="true">' +
                        '<div style="width:30px;" class="fa fa-{icon}"></div>' +
                        '<div type="{type}" style="flex:1">{xtype}</div>' +
                      '</div>'
                  },
                ],
              },
              {
                id: 'dynamicpanel', height: '100%',
                bodyStyle: 'background:white; padding:10px;',
                layout: {type: 'fit',align: 'stretch'},
                tbar: [
                  {text: 'Show Code',ui: 'action',handler:showCode}
                ],
                items: [
                  {xtype:'${this._xtype}',shadow:true}
                ]
              }
            ]
          });
        }
      });
    });
    </script>

    <script>
    const vscode = acquireVsCodeApi();

    function changeTitle() {
      var val = document.getElementById('2').value;
      vscode.postMessage({command: 'changeTitle', value: val})
    }

    function showCode() {
      console.log('showCode')
      vscode.postMessage({command: 'showCode'})
    }

    window.addEventListener('message', event => {
      console.log('we have a new message from the extension',event)
      const message = event.data;
      switch (message.type) {
        case 'documentchange':
          //console.log('in the case: documentchange from the extension')
          Ext.getCmp('dataview').setData(message.s)
          Ext.undefine('${this._namespace}')
          var head = document.getElementsByTagName('head')[0];
          var script = document.createElement("SCRIPT");
          script.text = message.code
          head.appendChild(script)
          Ext.getCmp('dynamicpanel').setItems({xtype:'${this._xtype}',shadow:true})
          break;
      }
    });
    </script>

    </html>`;
	}
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