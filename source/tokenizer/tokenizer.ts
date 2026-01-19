import { TokenizerError } from "./error.ts";
import { isWhitespace } from "./helpers.ts";

/** Token types for the filter expression grammar */
export type TokenType =
	| "IDENTIFIER"
	| "AND"
	| "OR"
	| "NOT"
	| "LEFT_PAREN"
	| "RIGHT_PAREN"
	| "EOF";

/** Represents a single token in the input stream */
export interface Token {
	type: TokenType;
	value: string;
	position: number;
	line: number;
	column: number;
}

interface EOFToken extends Token {
	type: "EOF";
}

export type TokenStream = readonly [...Token[], EOFToken];

/**
 * Tokenizer for the filter expression grammar
 *
 * Converts an input string into a stream of tokens.
 * Handles:
 * - Keywords: `and`, `or`, `not` (case-insensitive)
 * - Identifiers: any non-whitespace characters (may include wildcards)
 * - Parentheses: `(` and `)`
 * - Whitespace: ignored between tokens
 */
class Tokenizer {
	#input: string;
	#position: number = 0;
	#line: number = 1;
	#column: number = 1;

	constructor(input: string) {
		this.#input = input;
	}

	/** Tokenizes the entire input and returns all tokens */
	tokenize(): TokenStream {
		const tokens: Token[] = [];
		let token: Token;

		do {
			token = this.#nextToken();

			tokens.push(token);
		} while (token.type !== "EOF");

		// loop guarantees EOF termination
		return tokens as unknown as TokenStream;
	}

	/** Returns the next token from the input stream */
	#nextToken(): Token {
		this.#skipWhitespace();

		if (this.#position >= this.#input.length) {
			return this.#createToken("EOF", "");
		}

		const char = this.#peek();

		switch (char) {
			case "(": {
				const token = this.#createToken("LEFT_PAREN", "(");

				this.#advance();

				return token;
			}

			case ")": {
				const token = this.#createToken("RIGHT_PAREN", ")");

				this.#advance();

				return token;
			}

			default:
				return this.#readIdentifierOrKeyword();
		}
	}

	/** Skips whitespace characters (space, tab, newline) */
	#skipWhitespace(): void {
		loop: while (this.#position < this.#input.length) {
			const char = this.#peek();

			switch (char) {
				case " ":
				case "\t": {
					this.#advance();

					break;
				}

				case "\n": {
					this.#advance();

					this.#line += 1;
					this.#column = 1;

					break;
				}

				case "\r": {
					this.#advance();

					// handle `\r\n` as single newline
					if (this.#peek() === "\n") {
						this.#advance();
					}

					this.#line += 1;
					this.#column = 1;

					break;
				}

				default: {
					break loop;
				}
			}
		}
	}

	#readIdentifierOrKeyword(): Token {
		const startPosition = this.#position;
		const startLine = this.#line;
		const startColumn = this.#column;

		const value = this.#readIdentifier();

		if (value.length === 0) {
			throw new TokenizerError(
				`Unexpected character '${this.#peek()}'`,
				this.#position,
				this.#line,
				this.#column,
			);
		}

		const keywordType = this.#matchKeyword(value);

		if (keywordType === null) {
			return {
				type: "IDENTIFIER",
				value,
				position: startPosition,
				line: startLine,
				column: startColumn,
			};
		}

		return {
			type: keywordType,
			value,
			position: startPosition,
			line: startLine,
			column: startColumn,
		};
	}

	#readIdentifier(): string {
		let value = "";

		while (this.#position < this.#input.length) {
			const char = this.#peek();

			if (isWhitespace(char) || char === "(" || char === ")") {
				break;
			}

			value += char;

			this.#advance();
		}

		return value;
	}

	#matchKeyword(ident: string): TokenType | null {
		switch (ident.toLocaleLowerCase()) {
			case "and":
				return "AND";

			case "or":
				return "OR";

			case "not":
				return "NOT";

			default:
				return null;
		}
	}

	/** Advances to the next character */
	#advance(): void {
		if (this.#position < this.#input.length) {
			this.#position += 1;
			this.#column += 1;
		}
	}

	/** Creates a token at the current position */
	#createToken(type: TokenType, value: string): Token {
		return {
			type,
			value,
			position: this.#position,
			line: this.#line,
			column: this.#column,
		};
	}

	/** Returns the current character without advancing */
	#peek(): string | null {
		if (this.#position >= this.#input.length) {
			return null;
		}

		// biome-ignore lint/style/noNonNullAssertion: we check the boundary above
		return this.#input[this.#position]!;
	}
}

/** Tokenize an input string */
export const tokenize = (input: string): TokenStream =>
	new Tokenizer(input).tokenize();
