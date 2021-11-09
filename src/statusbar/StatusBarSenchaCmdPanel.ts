import * as vscode from "vscode";

export class StatusBarSenchaCmdPanel  {
  public static register(context: vscode.ExtensionContext) {
    const sbiExplorer: vscode.StatusBarItem = vscode.window.createStatusBarItem(1, 0);
    sbiExplorer.text = 'SenchaCmdPanel';
    //sbiExplorer.color = 'white';
    sbiExplorer.tooltip = `SenchaCmdPanel`;
    sbiExplorer.command = 'builder.SenchaCmdPanel';
    sbiExplorer.show();
    return sbiExplorer;
  }
}
