import { Position } from 'vscode';

export const JUMP_COMMAND_MODIFIER: string         = "jump";
export const FORWARD_COMMAND_MODIFIER: string      = "forward";
export const BACKWARDS_COMMAND_MODIFIER: string    = "backwards";
export const SELECTION_COMMAND_MODIFIER: string    = "selection";

export const JUMP_FORWARD_COMMAND_ID: string    = `${JUMP_COMMAND_MODIFIER}-${FORWARD_COMMAND_MODIFIER}`;
export const JUMP_BACKWARDS_COMMAND_ID: string  = `${JUMP_COMMAND_MODIFIER}-${BACKWARDS_COMMAND_MODIFIER}`;

export const JUMP_FORWARD_SELECTION_COMMAND_ID: string   = `${JUMP_FORWARD_COMMAND_ID}-${SELECTION_COMMAND_MODIFIER}`;
export const JUMP_BACKWARDS_SELECTION_COMMAND_ID: string = `${JUMP_BACKWARDS_COMMAND_ID}-${SELECTION_COMMAND_MODIFIER}`;

const NORMAL_BRACKET_OPENING: string = "(";
const NORMAL_BRACKET_CLOSING: string = ")";

const CURLY_BRACKET_OPENING: string = "{";
const CURLY_BRACKET_CLOSING: string = "}";

const SQUARE_BRACKET_OPENING: string = "[";
const SQUARE_BRACKET_CLOSING: string = "]";

const SINGLE_QUOTE: string = "'";
const DOUBLE_QUOTE: string = "\"";

const isNormalBracket = (char: string) => char === NORMAL_BRACKET_OPENING || char === NORMAL_BRACKET_CLOSING;
const isCurlyBracket  = (char: string) => char === CURLY_BRACKET_OPENING  || char === CURLY_BRACKET_CLOSING;
const isSquareBracket = (char: string) => char === SQUARE_BRACKET_OPENING || char === SQUARE_BRACKET_CLOSING;
const isQuote         = (char: string) => char === SINGLE_QUOTE           || char === DOUBLE_QUOTE;

export const isBracket = (char: string) => (isNormalBracket(char) || isCurlyBracket(char) || isSquareBracket(char) || isQuote(char));

export const DEFAULT_POSITION: Position = new Position(0,0);



