import * as vscode from "vscode";

export class StatusBarExtJSPanel  {
  public static register(context: vscode.ExtensionContext) {
    const sbiExplorer: vscode.StatusBarItem = vscode.window.createStatusBarItem(1, 0);
    sbiExplorer.text = 'ExtJSPanel';
    //sbiExplorer.color = 'white';
    sbiExplorer.tooltip = `ExtJSPanel`;
    sbiExplorer.command = 'builder.ExtJSPanel';
    sbiExplorer.show();
    return sbiExplorer;
  }
}
