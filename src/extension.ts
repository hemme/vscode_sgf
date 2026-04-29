import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext): void {
	const disposable = vscode.languages.registerDocumentFormattingEditProvider(
		{ scheme: "file", language: "sgf" },
		new SgfDocumentFormattingEditProvider()
	);
	context.subscriptions.push(disposable);
}

export function deactivate(): void {}

class SgfDocumentFormattingEditProvider
	implements vscode.DocumentFormattingEditProvider
{
	provideDocumentFormattingEdits(
		document: vscode.TextDocument,
		options: vscode.FormattingOptions
	): vscode.TextEdit[] {
		const fullText = document.getText();
		const fullRange = new vscode.Range(
			document.positionAt(0),
			document.positionAt(fullText.length)
		);
		const formatted = formatSgf(fullText, options);
		return [vscode.TextEdit.replace(fullRange, formatted)];
	}
}

function formatSgf(
	text: string,
	options: vscode.FormattingOptions
): string {
	const indentStr = options.insertSpaces
		? " ".repeat(options.tabSize)
		: "\t";
	const tokens = tokenize(text);
	if (tokens.length === 0) {
		return text;
	}
	return buildFormatted(tokens, indentStr);
}

interface Token {
	readonly type: "open" | "close" | "semicolon" | "ident" | "value";
	readonly value: string;
}

interface Property {
	ident: string;
	values: string[];
}

interface NodeEvent {
	type: "node";
	properties: Property[];
}

type Event = { type: "open" } | { type: "close" } | NodeEvent;

function tokenize(text: string): Token[] {
	const tokens: Token[] = [];
	let i = 0;
	while (i < text.length) {
		const ch = text[i];
		if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
			i++;
			continue;
		}
		if (ch === "(") {
			tokens.push({ type: "open", value: "(" });
			i++;
			continue;
		}
		if (ch === ")") {
			tokens.push({ type: "close", value: ")" });
			i++;
			continue;
		}
		if (ch === ";") {
			tokens.push({ type: "semicolon", value: ";" });
			i++;
			continue;
		}
		if (ch === "[") {
			const raw = readPropertyValue(text, i);
			tokens.push({ type: "value", value: raw });
			i += raw.length;
			continue;
		}
		if (ch >= "A" && ch <= "Z") {
			const raw = readIdent(text, i);
			tokens.push({ type: "ident", value: raw });
			i += raw.length;
			continue;
		}
		i++;
	}
	return tokens;
}

function readPropertyValue(text: string, start: number): string {
	let i = start + 1;
	let result = "[";
	while (i < text.length) {
		const ch = text[i];
		if (ch === "\\") {
			result += text[i] + (i + 1 < text.length ? text[i + 1] : "");
			i += 2;
			continue;
		}
		if (ch === "]") {
			result += "]";
			return result;
		}
		result += ch;
		i++;
	}
	return result;
}

function readIdent(text: string, start: number): string {
	let i = start;
	while (i < text.length && text[i] >= "A" && text[i] <= "Z") {
		i++;
	}
	return text.substring(start, i);
}

function parseEvents(tokens: Token[]): Event[] {
	const events: Event[] = [];
	let i = 0;
	while (i < tokens.length) {
		if (tokens[i].type === "open") {
			events.push({ type: "open" });
			i++;
		} else if (tokens[i].type === "close") {
			events.push({ type: "close" });
			i++;
		} else if (tokens[i].type === "semicolon") {
			i++;
			const properties: Property[] = [];
			while (
				i < tokens.length &&
				tokens[i].type !== "semicolon" &&
				tokens[i].type !== "open" &&
				tokens[i].type !== "close"
			) {
				if (tokens[i].type === "ident") {
					const ident = tokens[i].value;
					const values: string[] = [];
					i++;
					while (i < tokens.length && tokens[i].type === "value") {
						values.push(tokens[i].value);
						i++;
					}
					properties.push({ ident, values });
				} else {
					i++;
				}
			}
			events.push({ type: "node", properties });
		} else {
			i++;
		}
	}
	return events;
}

function formatProperty(prop: Property): string {
	return prop.ident + prop.values.join("");
}

function buildFormatted(tokens: Token[], indentStr: string): string {
	const events = parseEvents(tokens);
	const lines: string[] = [];
	let depth = 0;
	let rootFirstNodeDone = false;
	let rootBlankLineAdded = false;
	let pendingLine = "";
	let pendingDepth = 0;

	function calcIndent(d: number): number {
		return Math.max(0, d - 2);
	}

	function pushLine(content: string, indentLevel: number): void {
		lines.push(indentStr.repeat(indentLevel) + content);
	}

	function flushPending(): void {
		if (pendingLine) {
			pushLine(pendingLine, calcIndent(pendingDepth));
			pendingLine = "";
		}
	}

	function isFirstPropConcatenable(node: NodeEvent): boolean {
		if (node.properties.length === 0) return false;
		const firstVal = node.properties[0].values.join("").length;
		return firstVal <= 6;
	}

	for (let i = 0; i < events.length; i++) {
		const event = events[i];

		if (event.type === "open") {
			flushPending();
			const newDepth = depth + 1;
			if (newDepth === 1) {
				rootFirstNodeDone = false;
				rootBlankLineAdded = false;
			}
			pushLine("(", calcIndent(newDepth));
			depth = newDepth;
			continue;
		}

		if (event.type === "close") {
			flushPending();
			const closeIndent = calcIndent(depth);
			depth = Math.max(0, depth - 1);

			if (i + 1 < events.length && events[i + 1].type === "open") {
				const openIndent = calcIndent(depth + 1);
				pushLine(")(", openIndent);
				depth++;
				i++;
				continue;
			}

			pushLine(")", closeIndent);
			continue;
		}

		const node = event as NodeEvent;
		const isSingle = node.properties.length === 1;
		const isRoot = depth === 1;
		const firstConcatenable = isFirstPropConcatenable(node);

		if (firstConcatenable && pendingLine && pendingDepth === depth) {
			pendingLine += ";" + formatProperty(node.properties[0]);
			if (isSingle) {
				continue;
			}
			flushPending();
			const nodeIndent = calcIndent(depth);
			for (let p = 1; p < node.properties.length; p++) {
				pushLine(formatProperty(node.properties[p]), nodeIndent);
			}
			continue;
		}

		flushPending();

		if (isRoot && rootFirstNodeDone && !rootBlankLineAdded) {
			lines.push("");
			rootBlankLineAdded = true;
		}

		if (isRoot && !rootFirstNodeDone) {
			const shortParts: string[] = [];
			const longParts: string[] = [];
			let foundLong = false;

			for (const prop of node.properties) {
				const totalValueLen = prop.values.join("").length;
				if (!foundLong && totalValueLen <= 6) {
					shortParts.push(formatProperty(prop));
				} else {
					foundLong = true;
					longParts.push(formatProperty(prop));
				}
			}

			const header = ";" + shortParts.join("");
			const nodeIndent = calcIndent(depth);

			if (longParts.length > 0) {
				pushLine(header, nodeIndent);
				lines.push("");
				for (const lp of longParts) {
					pushLine(lp, nodeIndent);
				}
			} else if (isSingle) {
				pendingLine = header;
				pendingDepth = depth;
			} else {
				pushLine(header, nodeIndent);
			}

			rootFirstNodeDone = true;
			continue;
		}

		if (firstConcatenable) {
			pendingLine = ";" + formatProperty(node.properties[0]);
			pendingDepth = depth;
			if (!isSingle) {
				flushPending();
				const nodeIndent = calcIndent(depth);
				for (let p = 1; p < node.properties.length; p++) {
					pushLine(formatProperty(node.properties[p]), nodeIndent);
				}
			}
		} else {
			const nodeIndent = calcIndent(depth);
			pushLine(";" + formatProperty(node.properties[0]), nodeIndent);
			for (let p = 1; p < node.properties.length; p++) {
				pushLine(formatProperty(node.properties[p]), nodeIndent);
			}
		}
	}

	flushPending();
	return lines.join("\n") + "\n";
}
