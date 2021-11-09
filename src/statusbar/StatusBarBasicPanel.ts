import * as vscode from "vscode";

export class StatusBarBasicPanel  {
  public static register(context: vscode.ExtensionContext) {
    const sbiExplorer: vscode.StatusBarItem = vscode.window.createStatusBarItem(1, 0);
    sbiExplorer.text = 'BasicPanel';
    //sbiExplorer.color = 'white';
    sbiExplorer.tooltip = `BasicPanel`;
    sbiExplorer.command = 'builder.BasicPanel';
    sbiExplorer.show();
    return sbiExplorer;
  }
}
