/**
 * Base class for all expression errors.
 *
 * Provides common properties for error location and context.
 */
export abstract class ExpressionError extends Error {
	/** Position in the input string where the error occurred (0-based) */
	readonly position?: number;
	/** Line number where the error occurred (1-based) */
	readonly line?: number;
	/** Column number where the error occurred (1-based) */
	readonly column?: number;

	constructor(
		message: string,
		position?: number,
		line?: number,
		column?: number,
	) {
		super(message);

		this.name = this.constructor.name;
		this.position = position;
		this.line = line;
		this.column = column;
	}
}
