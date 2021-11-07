import * as vscode from "vscode";

export class StatusBarOpenWith  {
  public static register(context: vscode.ExtensionContext) {
    const sbiExplorer: vscode.StatusBarItem = vscode.window.createStatusBarItem(1, 0);
    sbiExplorer.text = 'OpenWith';
    sbiExplorer.color = 'white';
    sbiExplorer.tooltip = `OpenWith`;
    sbiExplorer.command = 'builder.OpenWith';
    sbiExplorer.show();
    return sbiExplorer;
  }
}
