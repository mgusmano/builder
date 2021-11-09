import * as vscode from "vscode";

export class StatusBarThemePanel  {
  public static register(context: vscode.ExtensionContext) {
    const sbiExplorer: vscode.StatusBarItem = vscode.window.createStatusBarItem(1, 0);
    sbiExplorer.text = 'ThemePanel';
    //sbiExplorer.color = 'white';
    sbiExplorer.tooltip = `ThemePanel`;
    sbiExplorer.command = 'builder.ThemePanel';
    sbiExplorer.show();
    return sbiExplorer;
  }
}
