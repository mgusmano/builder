import * as vscode from 'vscode';

export class Logger {
  static productName: string = 'Sencha Builder';
  static channel: vscode.OutputChannel;
  static log(message: any) {
    console.log(`${message}`);
    //console.log(this.channel);
    if (this.channel) {
      //console.log('here');
      this.channel.appendLine(`${message}`);
    }
  }
}