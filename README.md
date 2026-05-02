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
- **Document formatting** — format SGF files with `Shift+Alt+F` or *Format Document*
  - Smart indentation based on game tree depth
  - Short single-property nodes concatenated on one line
  - Root node header split: short properties inline, long properties on separate lines
  - Variants formatted with `)(` on a single indented line
  - Respects VS Code formatting settings (tabs vs spaces, tab size)

## Example

### Syntax highlighting

```sgf
(;GM[1]FF[4]SZ[19]PB[Honinbo Shusaku]PW[Gennan Inseki]
;B[pd]C[Classical opening]
;W[dp];B[pp]N[Star point]
;W[dd]
;B[qq]C[Approach move\] continuation]
)
```

### Formatting

Unformatted input:

```
(;GM[1]FF[4]SZ[19]PB[Honinbo Shusaku]PW[Gennan Inseki];B[pd]C[Classical opening];W[dp];B[pp];W[dd];B[qq])
```

After *Format Document*:

```sgf
(;GM[1]FF[4]SZ[19]

PB[Honinbo Shusaku]
PW[Gennan Inseki]

;B[pd]C[Classical opening]
;W[dp];B[pp]
;W[dd];B[qq]
)
```

## Requirements

Visual Studio Code **1.115.0** or later.

## Release Notes

### 0.1.0

- Full SGF syntax highlighting with color-coded property categories
- SGF document formatter with smart indentation
- Auto-closing brackets and bracket matching
- Escape sequence and multi-value property support
