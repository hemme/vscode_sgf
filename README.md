# SGF Highlighter

Syntax highlighting for [Smart Game Format (SGF)](https://en.wikipedia.org/wiki/Smart_Game_Format) files in Visual Studio Code.

SGF is the standard file format for recording game records, primarily used for board games like Go (Weiqi/Baduk), but also Othello, Backgammon, and others.

## Features

- Full SGF syntax highlighting for `.sgf` files
- Color-coded property identifiers by category:
  - **Move properties** (`B`, `W`) — stones played
  - **Setup properties** (`AB`, `AW`, `AE`) — board setup
  - **Game info** (`SZ`, `PB`, `PW`, `RE`, `GM`, `FF`, `DT`, `RU`, ...) — game metadata
  - **Markup** (`TR`, `CR`, `SQ`, `LB`, `AR`, `MA`, ...) — board annotations
  - **Move annotations** (`BM`, `TE`, `DO`, `IT`) — good/bad move markers
  - **Position annotations** (`DM`, `GB`, `GW`, `UC`) — position evaluation
  - **Comments** (`C[...]`) — highlighted as block comments
  - **All other properties** — generic property scope
- Escape sequence support (`\]`, `\\`, `\<newline>`)
- Multi-value property support (`AB[aa][bb][cc]`)
- Auto-closing brackets for `()` and `[]`
- Bracket matching for game tree delimiters

## Example

```sgf
(;GM[1]FF[4]SZ[19]PB[Honinbo Shusaku]PW[Gennan Inseki]
;B[pd]C[Classical opening]
;W[dp];B[pp]N[Star point]
;W[dd]
;B[qq]C[Approach move\] continuation]
)
```

## Requirements

Visual Studio Code **1.115.0** or later.

## Release Notes

### 0.0.1

Initial release with full SGF syntax highlighting support.
