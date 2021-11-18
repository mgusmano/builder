import * as vscode from 'vscode';
import { Logger } from './Logger';
import axios from "axios";

import { BasicTextEditorProvider } from './provider/BasicTextEditorProvider';

import { SenchaCmdPanel } from './panel/SenchaCmdPanel';
import { StatusBarSenchaCmdPanel } from './statusbar/StatusBarSenchaCmdPanel';

import { BasicPanel } from './panel/BasicPanel';
import { StatusBarBasicPanel } from './statusbar/StatusBarBasicPanel';

import { MessagingPanel } from './panel/MessagingPanel';
import { StatusBarMessagingPanel } from './statusbar/StatusBarMessagingPanel';

import { WebviewUIPanel } from './panel/WebviewUIPanel';
import { StatusBarWebviewUIPanel } from './statusbar/StatusBarWebviewUIPanel';

import { ExtJSPanel } from './panel/ExtJSPanel';
import { StatusBarExtJSPanel } from './statusbar/StatusBarExtJSPanel';

import { EWCPanel } from './panel/EWCPanel';
import { StatusBarEWCPanel } from './statusbar/StatusBarEWCPanel';

import { ThemePanel } from './panel/ThemePanel';
import { StatusBarThemePanel } from './statusbar/StatusBarThemePanel';

//import { StatusBarOpenWith } from './statusbar/StatusBarOpenWith';

export function activate(context: vscode.ExtensionContext) {

  ;(async () => {
    // const todos = await axios.get('https://jsonplaceholder.typicode.com/todos');
    // console.log(todos);
    const localRoot = 'https://my-json-server.typicode.com/mgusmano/builder';
    var url = `${localRoot}/skills2`;
    console.log(url);
    const skillsResult = await axios(url);
    console.log(skillsResult);
  })();



  Logger.channel = vscode.window.createOutputChannel("Sencha Builder");
  context.subscriptions.push(Logger.channel);
  Logger.log('Sencha Builder extension is now active!');

	// context.subscriptions.push(
	// 	vscode.commands.registerCommand('builder.cmd', () => {

  //   //   async function createTermAndRunCommand (name, theme, ctx, cmd) {
  //   //     this.termStack = [];

  //   //     function createTerm () {
  //   //         const term = window.createTerminal(`OpenArch`);
  //   //         this.termStack.push();
  //   //         return term
  //   //     }

  //   //     this.cmd = cmd;
  //   //     const term = createTerm();
  //   //     await term.sendText(`sencha generate app --ext -${theme} ${name} ./`);
  //   //     term.show();
  //   // }

	// 		const term = vscode.window.createTerminal(`OpenArch`);
  //     var theme = 'theme-material';
  //     var name = 'myapp';
  //     term.show();
  //     term.sendText(`sencha generate app --ext -modern --theme-name theme-material myapp ./myapp`);
	// 	})
	// );


  context.subscriptions.push(BasicTextEditorProvider.register(context));


  context.subscriptions.push(
		vscode.commands.registerCommand('builder.SenchaCmdPanel', () => {
			SenchaCmdPanel.createOrShow(context);
		})
	);
  context.subscriptions.push(StatusBarSenchaCmdPanel.register(context));


	context.subscriptions.push(
		vscode.commands.registerCommand('builder.BasicPanel', () => {
			BasicPanel.createOrShow(context);
		})
	);
  context.subscriptions.push(StatusBarBasicPanel.register(context));


  context.subscriptions.push(
		vscode.commands.registerCommand('builder.MessagingPanel', () => {
			MessagingPanel.createOrShow(context);
		})
	);
  context.subscriptions.push(StatusBarMessagingPanel.register(context));


	context.subscriptions.push(
		vscode.commands.registerCommand('builder.WebviewUIPanel', () => {
			WebviewUIPanel.createOrShow(context);
		})
	);
  context.subscriptions.push(StatusBarWebviewUIPanel.register(context));


	context.subscriptions.push(
		vscode.commands.registerCommand('builder.ExtJSPanel', () => {
			ExtJSPanel.createOrShow(context);
		})
	);
  context.subscriptions.push(StatusBarExtJSPanel.register(context));


	context.subscriptions.push(
		vscode.commands.registerCommand('builder.EWCPanel', () => {
			EWCPanel.createOrShow(context);
		})
	);
  context.subscriptions.push(StatusBarEWCPanel.register(context));


  context.subscriptions.push(
		vscode.commands.registerCommand('builder.ThemePanel', () => {
			ThemePanel.createOrShow(context);
		})
	);
  context.subscriptions.push(StatusBarThemePanel.register(context));

  // context.subscriptions.push(
	// 	vscode.commands.registerCommand('builder.OpenWith', () => {
  //     let uri = vscode.Uri.file('/Volumes/BOOTCAMP/@/BasicTextEditor/BasicTextEditor.jsb');
  //     //let success = await
  //     vscode.commands.executeCommand('vscode.openWith', uri, 'default');
	// 		//ThemePanel.createOrShow(context);
	// 	})
	// );
  // context.subscriptions.push(StatusBarOpenWith.register(context));


  console.log('Congratulations, your extension "builder" is now registered!');
}

export function deactivate() {}
