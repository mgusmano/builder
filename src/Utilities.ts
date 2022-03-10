import * as vscode from "vscode";
import { Uri, Webview } from "vscode";
import * as path from "path";
import { spawn } from "child_process";
import { isNullOrUndefined } from "util";
//import * as fs from "fs";

export class Utilities {

  private static getUriSingle(webview: vscode.Webview, extensionPath: string, file: string) {
    return webview.asWebviewUri(
      vscode.Uri.file(path.join(extensionPath, "assets", file))
    );
  }

  static getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
  }

  static getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  static async invokeCmd(cmd: string, args: Array<string>, opts: any, channel: vscode.OutputChannel) {
    const defaultOpts = {
      stdio: ['pipe', 'pipe', 'inherit'],
      customFds: [0,1,2],
      shell: true
    };
    const fullOpts = Object.assign(defaultOpts, opts);
    const process = spawn(cmd, args, fullOpts);
    channel.show();
    process.stdout.setEncoding('utf-8');
    process.stdout.on('data', function (data) {
      data = data.toString();
      channel.append(data);
    });

    return new Promise((resolve, reject) => {
      process.on("close", code => {
        channel.append('Done!');
        return resolve(code);
      })
        .on("error", err => {
          return reject(err);
        });
    });
  }
}