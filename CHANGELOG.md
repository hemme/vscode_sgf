# Change Log

All notable changes to the "sgf-highlighter" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.1.0]

### Added

- Full SGF syntax highlighting with color-coded property categories (move, setup, game info, markup, annotations, comments)
- Escape sequence support (`\]`, `\\`, `\<newline>`) and multi-value properties
- Auto-closing brackets for `()` and `[]` with bracket matching
- SGF document formatter with smart indentation, node concatenation, root node header splitting, and variant formatting