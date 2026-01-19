import type {
	AndExpression,
	Expression,
	IdentifierExpression,
	NotExpression,
	OrExpression,
} from "../ast/interface.ts";

/**
 * Evaluator for filter expressions
 *
 * Evaluates an AST against a set of entity names to determine if the expression matches.
 *
 * Evaluation semantics:
 * - `identifier`: `true` if ANY entity matches the pattern
 * - `and`: `true` if BOTH sides are `true` (short-circuit)
 * - `or`: `true` if EITHER side is `true` (short-circuit)
 * - `not`: negates the result
 */
class ExpressionEvaluator {
	#expression: Expression;

	constructor(expression: Expression) {
		this.#expression = expression;
	}

	/** Evaluates the expression and returns true/false */
	evaluate = (entities: readonly string[]): boolean => {
		return this.#eval(this.#expression, entities);
	};

	#eval(expression: Expression, entities: readonly string[]): boolean {
		switch (expression.type) {
			case "identifier":
				return this.#evaluateIdentifier(expression, entities);

			case "and":
				return this.#evaluateAnd(expression, entities);

			case "or":
				return this.#evaluateOr(expression, entities);

			case "not":
				return this.#evaluateNot(expression, entities);
		}
	}

	/**
	 * Evaluates an identifier expression.
	 *
	 * Returns true if ANY entity matches the pattern.
	 */
	#evaluateIdentifier(
		expr: IdentifierExpression,
		entities: readonly string[],
	): boolean {
		return entities.some((entity) => expr.pattern === entity);
	}

	/** Evaluates an `AND` expression with short-circuit evaluation */
	#evaluateAnd(expr: AndExpression, entities: readonly string[]): boolean {
		return this.#eval(expr.left, entities) && this.#eval(expr.right, entities);
	}

	/** Evaluates an `OR` expression with short-circuit evaluation */
	#evaluateOr(expr: OrExpression, entities: readonly string[]): boolean {
		return this.#eval(expr.left, entities) || this.#eval(expr.right, entities);
	}

	/** Evaluates a `NOT` expression */
	#evaluateNot(expr: NotExpression, entities: readonly string[]): boolean {
		return !this.#eval(expr.expr, entities);
	}
}

export const createEvaluator = (expression: Expression): ExpressionEvaluator =>
	new ExpressionEvaluator(expression);

export const evaluate = (
	expression: Expression,
	entities: readonly string[],
): boolean => new ExpressionEvaluator(expression).evaluate(entities);
