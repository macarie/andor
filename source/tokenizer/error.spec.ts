import { describe, it } from "vitest";
import { TokenizerError } from "./error.ts";

describe("`TokenizerError`", { concurrent: true }, () => {
	it("has position information", ({ expect }) => {
		const error = new TokenizerError("Unexpected character", 5, 1, 6);

		expect(error.position).toBe(5);
		expect(error.line).toBe(1);
		expect(error.column).toBe(6);
		expect(error.message).toBe("Unexpected character");
	});

	it("is an instance of `Error`", ({ expect }) => {
		const error = new TokenizerError("Test error", 0, 1, 1);

		expect(error).toBeInstanceOf(Error);
	});
});
