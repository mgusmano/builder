import * as vscode from "vscode";
import { Uri, Webview } from "vscode";
import * as path from "path";
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

}