import * as vscode from 'vscode';
import * as constants from './constants';

export function activate(context: vscode.ExtensionContext) {	
	const findBracketForward: any = (lineNumber: number, charNumber: number, lineContent: string, document: vscode.TextDocument) => {
		while (++charNumber < lineContent.length) 
		{
			const currentCharecter = lineContent[charNumber];

			if (constants.isBracket(currentCharecter)) 
			{
				return new vscode.Position(lineNumber, charNumber);;
			}
		}

		if (lineNumber === document.lineCount - 1) 
		{
			return { lineNumber, charNumber };
		}

		lineNumber += 1;
		charNumber = 0;
		lineContent = document.lineAt(lineNumber).text;

		return findBracketForward(lineNumber, charNumber, lineContent, document);
	};

	const findBracketBackwards: any = (lineNumber: number, charNumber: number, lineContent: string, document: vscode.TextDocument) => {
		while (--charNumber > 0) 
		{
			const currentCharecter = lineContent[charNumber];

			if (constants.isBracket(currentCharecter))
			{
				return new vscode.Position(lineNumber, charNumber);;
			}
		}

		lineNumber -= 1;
		lineContent = document.lineAt(lineNumber).text;
		charNumber  = lineContent.length;

		if (lineNumber === -1)
		{
			return { lineNumber: 0, charNumber: 0 };
		}

		return findBracketBackwards(lineNumber, charNumber, lineContent, document);
	};

	const run = (findBracket: any, isSelection: boolean) => {
		return () => {
			const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;

			if (!editor) 
			{
				return;
			}

			let document: vscode.TextDocument = editor.document,
			
				currentSelection: vscode.Selection = editor.selection,

				currentStart: vscode.Position 	= currentSelection.isReversed ? currentSelection.active : currentSelection.anchor,
				currentEnd: vscode.Position 	= currentSelection.isReversed ? currentSelection.anchor : currentSelection.active,
				
				bracketPosition: vscode.Position = constants.DEFAULT_POSITION,

				line = 0, character = 0, lineContent = '';

			if (isSelection) 
			{				
				if (currentSelection.isReversed)
				{
					line = currentStart.line;
					character = currentStart.character;
					lineContent = document.lineAt(line).text;

					bracketPosition = findBracket(line, character, lineContent, document);
					editor.selection = new vscode.Selection(currentEnd, bracketPosition);

					return;
				}
				else
				{
					line = currentEnd.line;
					character = currentEnd.character;
					lineContent = document.lineAt(line).text;

					bracketPosition = findBracket(line, character, lineContent, document);
					editor.selection = new vscode.Selection(currentStart, bracketPosition);

					return;
				}
			}
			else
			{
				line = currentStart.line;
				character = currentStart.character;
				lineContent = document.lineAt(line).text;

				bracketPosition = findBracket(line, character, lineContent, document);
				editor.selection = new vscode.Selection(bracketPosition, bracketPosition);
			}			
		};
	};

	
	const registerCommand = (command: string, run: any) => {
		context.subscriptions.push(vscode.commands.registerCommand(command, run));
	};
	
	const isSelection = true;

	registerCommand(constants.JUMP_FORWARD_COMMAND_ID, run(findBracketForward, !isSelection));
	registerCommand(constants.JUMP_BACKWARDS_COMMAND_ID, run(findBracketBackwards, !isSelection));

	registerCommand(constants.JUMP_FORWARD_SELECTION_COMMAND_ID, run(findBracketForward, isSelection));
	registerCommand(constants.JUMP_BACKWARDS_SELECTION_COMMAND_ID, run(findBracketBackwards, isSelection));
}

export function deactivate() {}
