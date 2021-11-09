import * as vscode from "vscode";

export class StatusBarEWCPanel  {
  public static register(context: vscode.ExtensionContext) {
    const sbiExplorer: vscode.StatusBarItem = vscode.window.createStatusBarItem(1, 0);
    sbiExplorer.text = 'EWCPanel';
    //sbiExplorer.color = 'white';
    sbiExplorer.tooltip = `EWCPanel`;
    sbiExplorer.command = 'builder.EWCPanel';
    sbiExplorer.show();
    return sbiExplorer;
  }
}
