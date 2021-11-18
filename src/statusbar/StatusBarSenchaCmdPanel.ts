import * as vscode from "vscode";

export class StatusBarSenchaCmdPanel  {
  public static register(context: vscode.ExtensionContext) {
    const sbiExplorer: vscode.StatusBarItem = vscode.window.createStatusBarItem(1, 0);
    sbiExplorer.text = 'New Ext JS App';
    //sbiExplorer.color = 'white';
    sbiExplorer.tooltip = `Create a New Ext JS Application`;
    sbiExplorer.command = 'builder.SenchaCmdPanel';
    sbiExplorer.show();
    return sbiExplorer;
  }
}
