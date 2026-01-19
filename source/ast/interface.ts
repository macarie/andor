/**
 * Represents an identifier expression with optional wildcard patterns.
 *
 * The pattern may contain `*` wildcards that match any sequence of characters.
 *
 * @example
 * { type: 'identifier', pattern: 'slow' }
 * { type: 'identifier', pattern: 'test_*' }
 * { type: 'identifier', pattern: '*integration*' }
 */
export interface IdentifierExpression {
	type: "identifier";
	pattern: string;
}

/**
 * Represents a logical `AND` expression.
 *
 * Evaluates to true only if both left and right expressions are true.
 *
 * @example
 * // slow and integration
 * {
 *   type: 'and',
 *   left: { type: 'identifier', pattern: 'slow' },
 *   right: { type: 'identifier', pattern: 'integration' }
 * }
 */
export interface AndExpression {
	type: "and";
	left: Expression;
	right: Expression;
}

/**
 * Represents a logical `OR` expression.
 *
 * Evaluates to true if either left or right expression is true.
 *
 * @example
 * // slow or fast
 * {
 *   type: 'or',
 *   left: { type: 'identifier', pattern: 'slow' },
 *   right: { type: 'identifier', pattern: 'fast' }
 * }
 */
export interface OrExpression {
	type: "or";
	left: Expression;
	right: Expression;
}

/**
 * Represents a logical `NOT` expression.
 *
 * Evaluates to true if the inner expression is false.
 *
 * @example
 * // not slow
 * {
 *   type: 'not',
 *   expr: { type: 'identifier', pattern: 'slow' }
 * }
 */
export interface NotExpression {
	type: "not";
	expr: Expression;
}

/**
 * Union type representing all possible AST expression nodes.
 */
export type Expression =
	| IdentifierExpression
	| AndExpression
	| OrExpression
	| NotExpression;
