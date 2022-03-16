import * as vscode from "vscode";
import { Logger } from "../Logger";
import * as path from "path";
import { controllerFile, mainFile, modelFile } from "./Templates";
import * as fs from "fs";

export class ViewScaffold {
  public _context: vscode.ExtensionContext;
  private readonly _extensionUri: vscode.Uri;
  private channel: vscode.OutputChannel;

  constructor(private readonly context: vscode.ExtensionContext) {
    Logger.log(`${Logger.productName}: BasicTextEditorProvider constructor`);
    this._context = context;
    this._extensionUri = context.extensionUri;
    this.channel = vscode.window.createOutputChannel("Scaffold");
  }
  // Validate path and check if view already exists.
  private validateWs(w: string, name: string, appendPath: boolean = true) {
    try {
      const dir  = appendPath 
      ? path.join(w, "app", "desktop", "src", "view")
      : w;
      const appFolderExists = fs.existsSync(dir);
      if (!appFolderExists) {
        vscode.window.showErrorMessage(`Cannot find ${dir} in ${w}`);
        return { valid: false };
      }
      const viewExists = fs.existsSync(path.join(dir, name));
      if (viewExists) {
        vscode.window.showErrorMessage(`View "${name}" already exists.`);
        return { valid: false };
      }
    } catch (error: any) {
      vscode.window.showErrorMessage(`Error: ${error}`);
    }
    return { valid: true };
  }

  // Generates the necessary files.
  private scaffold(w: string, name: string, appendPath: boolean = true) {
    const dir  = appendPath 
    ? path.join(w, "app", "desktop", "src", "view", name)
    : path.join(w, name);
    const fileName = name.charAt(0).toUpperCase() + name.slice(1);
    try {
      fs.mkdirSync(`${dir}`);
      fs.writeFileSync(`${dir}/${fileName}View.js`, mainFile(fileName), "utf-8");
      fs.writeFileSync(`${dir}/${fileName}ViewController.js`, controllerFile(fileName), "utf-8");
      fs.writeFileSync(`${dir}/${fileName}ViewModel.js`, modelFile(fileName), "utf-8");
      fs.writeFileSync(`${dir}/${fileName}View.scss`, "", "utf-8");
    } catch (error: any) {
      vscode.window.showErrorMessage("Unable to scaffold view");
      this.channel.show();
      this.channel.append(error?.message);
    }
  }

  public async generate(fPath ?: string) {
    let wp = fPath ? fPath : vscode.workspace.workspaceFolders![0].uri.fsPath;
    const appendPath = fPath ? false : true;
    const name = await vscode.window.showInputBox({
      value: 'sample',
      ignoreFocusOut: true,
      placeHolder: 'For example: "sample". But not "&*34a"',
      validateInput: text => {
        let re = /^[a-zA-Z]\w*/g;
        return re.test(text) ? null : "Not valid";
      }
    });
    if (!name) {
      vscode.window.showInformationMessage("Name is required. Cancelling...");
      return;
    }
    const result = this.validateWs(wp, name, appendPath);
    if (!result.valid) { return; };
    this.scaffold(wp, name, appendPath);
    vscode.window.showInformationMessage(`Scaffolding new view in ${wp}`);
  }
}
