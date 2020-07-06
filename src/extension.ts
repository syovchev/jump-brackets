"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants = require("./constants");
function activate(context) {

    // used to track last position hit when going backwards and forwards
    // and also having +1.
    let trackPos = 0;

    const findBracketForward = (lineNumber, charNumber, lineContent, document) => {
        while (++charNumber < lineContent.length) {

            const currentCharecter = lineContent[charNumber];
            const nextCharecter = lineContent[charNumber + 1];

            if (constants.isBracket(currentCharecter)) {

                let newPosition = charNumber;

                // opening brackets can benefit from +1 unless they are already
                // at the end of the line. They can also benefit from a +2 if they
                // are followed with a quote. we trackPos in case there we switch
                // to backwards, otherwise it would get stuck momentarily.
                if (currentCharecter.match(/[\{\[\(]/)) {
                    if (typeof nextCharecter == 'undefined') {
                        newPosition = lineContent.length;
                    }
                    else {
                        if (nextCharecter.match(/[\"\']/)) {
                            newPosition = charNumber + 2;
                        }
                        else {
                            newPosition = charNumber + 1;
                        }
                    }
                    trackPos = charNumber;
                    return new vscode.Position(lineNumber, newPosition);
                }

                // quotes can benefit from +1 only if they are not closing which can
                // be identified by a succession of space, comma, tab etc.
                else if (currentCharecter.match(/[\"\']/)) {

                    if (typeof nextCharecter != 'undefined') {
                        if (nextCharecter.match(/[\s;,\t\)\]\}]/) != null) {
                            newPosition = charNumber;
                        }
                        else {
                            newPosition = charNumber + 1;
                        }
                    }
                    trackPos = charNumber;
                    return new vscode.Position(lineNumber, newPosition);
                }
                else {
                    trackPos = charNumber;
                    return new vscode.Position(lineNumber, charNumber);
                }

            }
        }
        if (lineNumber === document.lineCount - 1) {
            return { lineNumber, charNumber };
        }
        lineNumber += 1;
        charNumber = 0;
        lineContent = document.lineAt(lineNumber).text;

        // we reset here in case we switch between backward and forward
        // trackpos is never used in going forward.
        trackPos = charNumber;

        return findBracketForward(lineNumber, charNumber, lineContent, document);
    };



    const findBracketBackwards = (lineNumber, charNumber, lineContent, document) => {
        while (--charNumber > 0) {

            const currentCharecter = lineContent[charNumber];
            const previousCharecter = lineContent[charNumber - 1];
            const nextCharecter = lineContent[charNumber + 1];

            if (constants.isBracket(currentCharecter)) {

                // opening brackets will usually go +1 but we need to make sure
                // we don't get stuck, as because we are going backwards, we need
                // to track if we are hitting the same spot.
                if (currentCharecter.match(/[\{\[\(]/)) {
                    if (trackPos == charNumber) {
                        trackPos = 0;
                        continue;
                    }
                    trackPos = charNumber;
                    return new vscode.Position(lineNumber, charNumber + 1);
                }

                // quotes can also suffer from hitting the same spot +1 condition
                // when going backwards.
                else if (currentCharecter.match(/[\"\']/)) {
                    if (typeof nextCharecter != 'undefined') {
                        if (nextCharecter.match(/[\s;,\t]/) == null) {
                            if (trackPos == charNumber) {
                                trackPos = 0;
                                continue;
                            }
                            trackPos = charNumber;
                            return new vscode.Position(lineNumber, charNumber + 1);
                        }
                    }

                    trackPos = false;
                    return new vscode.Position(lineNumber, charNumber);
                }

                else {
                    trackPos = false;
                    return new vscode.Position(lineNumber, charNumber);
                }
            }
        }

        lineNumber -= 1;
        lineContent = document.lineAt(lineNumber).text;
        charNumber = lineContent.length;
        if (lineNumber === -1) {
            return { lineNumber: 0, charNumber: 0 };
        }
        return findBracketBackwards(lineNumber, charNumber, lineContent, document);
    };

    const run = (findBracket, isSelection) => {
        return () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            let document = editor.document, currentSelection = editor.selection, currentStart = currentSelection.isReversed ? currentSelection.active : currentSelection.anchor, currentEnd = currentSelection.isReversed ? currentSelection.anchor : currentSelection.active, bracketPosition = constants.DEFAULT_POSITION, line = 0, character = 0, lineContent = '';
            if (isSelection) {
                if (currentSelection.isReversed) {
                    line = currentStart.line;
                    character = currentStart.character;
                    lineContent = document.lineAt(line).text;
                    bracketPosition = findBracket(line, character, lineContent, document);
                    editor.selection = new vscode.Selection(currentEnd, bracketPosition);
                    return;
                }
                else {
                    line = currentEnd.line;
                    character = currentEnd.character;
                    lineContent = document.lineAt(line).text;
                    bracketPosition = findBracket(line, character, lineContent, document);
                    editor.selection = new vscode.Selection(currentStart, bracketPosition);
                    return;
                }
            }
            else {
                line = currentStart.line;
                character = currentStart.character;
                lineContent = document.lineAt(line).text;
                bracketPosition = findBracket(line, character, lineContent, document);
                editor.selection = new vscode.Selection(bracketPosition, bracketPosition);
            }
        };
    };
    const registerCommand = (command, run) => {
        context.subscriptions.push(vscode.commands.registerCommand(command, run));
    };
    const isSelection = true;
    registerCommand(constants.JUMP_FORWARD_COMMAND_ID, run(findBracketForward, !isSelection));
    registerCommand(constants.JUMP_BACKWARDS_COMMAND_ID, run(findBracketBackwards, !isSelection));
    registerCommand(constants.JUMP_FORWARD_SELECTION_COMMAND_ID, run(findBracketForward, isSelection));
    registerCommand(constants.JUMP_BACKWARDS_SELECTION_COMMAND_ID, run(findBracketBackwards, isSelection));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map