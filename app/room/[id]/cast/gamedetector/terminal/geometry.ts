/*
 * The terminal screen has a fixed layout: an on-screen keyboard (5 rows of 8
 * glyphs, 24 x 16 game px apart) and, above it, the input field: 9 cells 8 px
 * apart holding 4 characters, a dash and 4 characters, all in one 6x13 font.
 */
export const KEYBOARD = ["ABCDEFGH", "IJKLMNOP", "QRSTUVWX", "YZ012345", "6789?!"];
export const KEY_X = 31; // keyboard 'A' glyph in game px (searched around this)
export const KEY_Y = 113;
export const KEY_DX = 24;
export const KEY_DY = 16;
export const GLYPH_H = 13;
export const CELL_W = 8; // glyphs sit in columns 1-6 of an 8-wide cell
export const CELL_PX = CELL_W * GLYPH_H;
export const INPUT_DX = 32; // input cell 0 relative to keyboard 'A'
export const INPUT_DY = -48;
export const INPUT_CELLS = 9;
export const DASH_CELL = 4;
export const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?";
export const ACCEPTED_DX = 221; // "CODE ACCEPTED!" text relative to keyboard 'A'
export const ACCEPTED_DY = -59;
