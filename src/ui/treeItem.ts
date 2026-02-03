import * as vscode from 'vscode';

function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export class TreeItem extends vscode.TreeItem {
  type: string;
  contextValue?: string;
  viewItem: string;

  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    type: string
  ) {
    super(label, collapsibleState);
    this.type = type;
    this.id = `${type}-${generateUniqueId()}`;
    this.viewItem = type;
  }
}
