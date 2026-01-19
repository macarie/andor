import { ExpressionError } from "../error.ts";

import type { Token } from "../tokenizer/tokenizer.ts";

/** Error thrown during parsing */
export class ParseError extends ExpressionError {
	/** What the parser expected to find */
	readonly expected?: string;
	/** What the parser actually found */
	readonly actual?: string;

	constructor(
		message: string,
		position?: number,
		line?: number,
		column?: number,
		expected?: string,
		actual?: string,
	) {
		super(message, position, line, column);

		this.expected = expected;
		this.actual = actual;
	}

	/** Creates a `ParseError` from a token */
	static fromToken(
		message: string,
		token: Token,
		expected?: string,
	): ParseError {
		return new ParseError(
			message,
			token.position,
			token.line,
			token.column,
			expected,
			token.value || token.type,
		);
	}
}
