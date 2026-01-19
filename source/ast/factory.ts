import type {
	AndExpression,
	Expression,
	IdentifierExpression,
	NotExpression,
	OrExpression,
} from "./interface.ts";

/**
 * Creates an identifier expression node.
 *
 * @param pattern - The identifier pattern (may include `*` wildcards)
 * @returns An {@linkcode IdentifierExpression} node
 *
 * @example
 * identifier('slow')
 * identifier('test_*')
 */
export function identifier(pattern: string): IdentifierExpression {
	return { type: "identifier", pattern };
}

/**
 * Creates an `AND` expression node.
 *
 * @param left - The left operand expression
 * @param right - The right operand expression
 * @returns An {@linkcode AndExpression} node
 *
 * @example
 * and(identifier('slow'), identifier('integration'))
 */
export function and(left: Expression, right: Expression): AndExpression {
	return { type: "and", left, right };
}

/**
 * Creates an `OR` expression node.
 *
 * @param left - The left operand expression
 * @param right - The right operand expression
 * @returns An {@linkcode OrExpression} node
 *
 * @example
 * or(identifier('slow'), identifier('fast'))
 */
export function or(left: Expression, right: Expression): OrExpression {
	return { type: "or", left, right };
}

/**
 * Creates a `NOT` expression node.
 *
 * @param expr - The expression to negate
 * @returns A {@linkcode NotExpression} node
 *
 * @example
 * not(identifier('slow'))
 */
export function not(expr: Expression): NotExpression {
	return { type: "not", expr };
}
