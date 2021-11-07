import * as vscode from "vscode";

export class StatusBarMessagingPanel  {
  public static register(context: vscode.ExtensionContext) {
    const sbiExplorer: vscode.StatusBarItem = vscode.window.createStatusBarItem(1, 0);
    sbiExplorer.text = 'MessagingPanel';
    sbiExplorer.color = 'white';
    sbiExplorer.tooltip = `MessagingPanel`;
    sbiExplorer.command = 'builder.MessagingPanel';
    sbiExplorer.show();
    return sbiExplorer;
  }
}
