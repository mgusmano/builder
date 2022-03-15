import * as vscode from 'vscode';
import { Logger } from './Logger';
import axios from "axios";

import { BasicTextEditorProvider } from './provider/BasicTextEditorProvider';

import { ViewScaffold } from './scaffold/View';

import { SenchaCmdPanel } from './panel/SenchaCmdPanel';
import { StatusBarSenchaCmdPanel } from './statusbar/StatusBarSenchaCmdPanel';

export function activate(context: vscode.ExtensionContext) {

  ;(async () => {
    // const todos = await axios.get('https://jsonplaceholder.typicode.com/todos');
    // console.log(todos);
    //const localRoot = 'https://my-json-server.typicode.com/mgusmano/toshibaserver';
    const localRoot = 'https://my-json-server.typicode.com/mgusmano/builder';

    var url = `${localRoot}/skills`;
    console.log(url);
    const skillsResult = await axios(url);
    console.log(skillsResult);
  })();



  Logger.channel = vscode.window.createOutputChannel("Sencha Builder");
  context.subscriptions.push(Logger.channel);
  Logger.log('Sencha Builder extension is now active!');

  context.subscriptions.push(BasicTextEditorProvider.register(context));


  context.subscriptions.push(
		vscode.commands.registerCommand('builder.SenchaCmdPanel', () => {
			SenchaCmdPanel.createOrShow(context);
		})
	);
  context.subscriptions.push(StatusBarSenchaCmdPanel.register(context));

  context.subscriptions.push(
		vscode.commands.registerCommand('builder.ViewGen', () => {
			const scaffold = new ViewScaffold(context);
      scaffold.generate();
		})
	);

  console.log('Congratulations, your extension "builder" is now registered!');
}

export function deactivate() {}
