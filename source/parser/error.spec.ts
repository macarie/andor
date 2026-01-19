import { describe, it } from "vitest";
import { ParseError } from "./error.ts";

describe("`ParseError`", { concurrent: true }, () => {
	it("has correct properties", ({ expect }) => {
		const error = new ParseError("Test error", 5, 1, 6, "identifier", "and");

		expect(error.message).toBe("Test error");
		expect(error.position).toBe(5);
		expect(error.line).toBe(1);
		expect(error.column).toBe(6);
		expect(error.expected).toBe("identifier");
		expect(error.actual).toBe("and");
		expect(error.name).toBe("ParseError");
	});

	it("is an instance of `Error`", ({ expect }) => {
		const error = new ParseError("Test error", 0, 1, 1);
		expect(error).toBeInstanceOf(Error);
	});
});
