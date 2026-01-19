import { and, identifier, not, or } from "../ast/factory.ts";
import { tokenize } from "../tokenizer/tokenizer.ts";
import { ParseError } from "./error.ts";

import type { Expression } from "../ast/interface.ts";
import type { Token, TokenType } from "../tokenizer/tokenizer.ts";

/**
 * Recursive descent parser for filter expressions
 *
 * Implements the following grammar with correct precedence:
 *
 * ```
 * expression  ::= or_expr
 * or_expr     ::= and_expr ( OR and_expr )*
 * and_expr    ::= not_expr ( AND not_expr )*
 * not_expr    ::= NOT not_expr | primary
 * primary     ::= identifier | "(" expression ")"
 * ```
 *
 * Precedence (highest to lowest):
 * 1. `not`
 * 2. `and`
 * 3. `or`
 *
 * Associativity:
 * - `and`, `or`: left-associative
 * - `not`: right-associative
 */
class Parser {
	#tokens: readonly Token[];
	#current: number = 0;

	constructor(tokens: readonly Token[]) {
		this.#tokens = tokens;
	}

	/** Parses the token stream and returns the AST */
	parse(): Expression {
		if (this.#hasReachedEOF()) {
			throw ParseError.fromToken(
				"Unexpected end of input: expected expression",
				this.#peek(),
				"expression",
			);
		}

		const expression = this.#expression();

		if (!this.#hasReachedEOF()) {
			// biome-ignore lint/style/noNonNullAssertion: if we have not reached EOF we have a token
			const token = this.#peek()!;

			throw ParseError.fromToken(
				`Unexpected token '${token.value}'`,
				token,
				"end of expression",
			);
		}

		return expression;
	}

	/** Entry point for parsing an expression */
	#expression(): Expression {
		return this.#orExpression();
	}

	/**
	 * Parses `OR` expressions (lowest precedence)
	 *
	 * ```
	 * or_expr ::= and_expr ( OR and_expr )*
	 * ```
	 */
	#orExpression(): Expression {
		let left = this.#andExpression();

		while (this.#matchesAny("OR")) {
			const right = this.#andExpression();

			left = or(left, right);
		}

		return left;
	}

	/**
	 * Parses `AND` expressions
	 *
	 * ```
	 * and_expr ::= not_expr ( AND not_expr )*
	 * ```
	 */
	#andExpression(): Expression {
		let left = this.#notExpression();

		while (this.#matchesAny("AND")) {
			const right = this.#notExpression();

			left = and(left, right);
		}

		return left;
	}

	/**
	 * Parses `NOT` expressions (right-associative)
	 *
	 * ```
	 * not_expr ::= NOT not_expr | primary
	 * ```
	 */
	#notExpression(): Expression {
		if (this.#matchesAny("NOT")) {
			// right-associative: parse another not_expr
			const expression = this.#notExpression();

			return not(expression);
		}

		return this.#primary();
	}

	/**
	 * Parses primary expressions (identifiers and parenthesized expressions)
	 *
	 * ```
	 * primary ::= identifier | "(" expression ")"
	 * ```
	 */
	#primary(): Expression {
		// parenthesized expression
		if (this.#matchesAny("LEFT_PAREN")) {
			const expression = this.#expression();

			this.#consume("RIGHT_PAREN", "Expected ')' after expression");

			return expression;
		}

		// identifier
		if (this.#check("IDENTIFIER")) {
			const token = this.#consume("IDENTIFIER", "Expecte identifier");

			return identifier(token.value);
		}

		// error cases
		const token = this.#peek();

		if (token.type === "EOF") {
			throw ParseError.fromToken(
				'Unexpected end of input: expected identifier or "("',
				token,
				'identifier or "("',
			);
		}

		if (token.type === "RIGHT_PAREN") {
			throw ParseError.fromToken(
				"Unexpected ')': missing opening parenthesis or expression",
				token,
				'identifier or "("',
			);
		}

		if (token.type === "AND" || token.type === "OR") {
			throw ParseError.fromToken(
				`Unexpected '${token.value}': missing left operand`,
				token,
				'identifier or "("',
			);
		}

		throw ParseError.fromToken(
			`Unexpected token '${token.value}'`,
			token,
			'identifier or "("',
		);
	}

	/** If the current token matches any of the given types, advance and return true */
	#matchesAny(...types: TokenType[]): boolean {
		for (const type of types) {
			if (this.#check(type)) {
				this.#advance();

				return true;
			}
		}

		return false;
	}

	/** Checks if the current token has the given type */
	#check(type: TokenType): boolean {
		if (this.#hasReachedEOF()) {
			return false;
		}

		return this.#peek().type === type;
	}

	/** Consumes a token of the expected type, or throws an error */
	#consume(type: TokenType, message: string): Token {
		if (this.#check(type)) {
			const token = this.#peek();

			this.#advance();

			return token;
		}

		throw ParseError.fromToken(message, this.#peek(), type);
	}

	/** Advances to the next token and returns the previous one */
	#advance(): void {
		if (this.#current < this.#tokens.length) {
			this.#current += 1;
		}
	}

	/** Returns the current token without advancing */
	#peek(): Token {
		// biome-ignore lint/style/noNonNullAssertion: #current is clamped to boundaries
		return this.#tokens[this.#current]!;
	}

	#hasReachedEOF(): boolean {
		const token = this.#peek();

		return token.type === "EOF";
	}
}

/**
 * Parse an expression from a string
 */
export function parse(input: string): Expression {
	const tokens = tokenize(input);

	return new Parser(tokens).parse();
}
