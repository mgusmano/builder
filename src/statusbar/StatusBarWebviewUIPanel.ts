import * as vscode from "vscode";

export class StatusBarWebviewUIPanel  {
  public static register(context: vscode.ExtensionContext) {
    const sbiExplorer: vscode.StatusBarItem = vscode.window.createStatusBarItem(1, 0);
    sbiExplorer.text = 'WebviewUIPanel';
    sbiExplorer.color = 'white';
    sbiExplorer.tooltip = `WebviewUIPanel`;
    sbiExplorer.command = 'builder.WebviewUIPanel';
    sbiExplorer.show();
    return sbiExplorer;
  }
}
