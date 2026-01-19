import { describe, it } from "vitest";
import { ParseError } from "./error.ts";
import { parse } from "./parser.ts";

describe("`Parser`", { concurrent: true }, () => {
	describe("single identifier", () => {
		it("parses a simple identifier", ({ expect }) => {
			const expr = parse("slow");

			expect(expr).toEqual({ type: "identifier", pattern: "slow" });
		});
	});

	describe("`AND` expressions", () => {
		it("parses simple `AND`", ({ expect }) => {
			const expr = parse("slow and integration");

			expect(expr).toEqual({
				type: "and",
				left: { type: "identifier", pattern: "slow" },
				right: { type: "identifier", pattern: "integration" },
			});
		});

		it("parses chained `AND` (left-associative)", ({ expect }) => {
			const expr = parse("a and b and c");

			expect(expr).toEqual({
				type: "and",
				left: {
					type: "and",
					left: { type: "identifier", pattern: "a" },
					right: { type: "identifier", pattern: "b" },
				},
				right: { type: "identifier", pattern: "c" },
			});
		});
	});

	describe("`OR` expressions", () => {
		it("parses simple `OR`", ({ expect }) => {
			const expr = parse("slow or fast");

			expect(expr).toEqual({
				type: "or",
				left: { type: "identifier", pattern: "slow" },
				right: { type: "identifier", pattern: "fast" },
			});
		});

		it("parses chained `OR` (left-associative)", ({ expect }) => {
			const expr = parse("a or b or c");

			expect(expr).toEqual({
				type: "or",
				left: {
					type: "or",
					left: { type: "identifier", pattern: "a" },
					right: { type: "identifier", pattern: "b" },
				},
				right: { type: "identifier", pattern: "c" },
			});
		});
	});

	describe("`NOT` expressions", () => {
		it("parses simple `NOT`", ({ expect }) => {
			const expr = parse("not slow");

			expect(expr).toEqual({
				type: "not",
				expr: { type: "identifier", pattern: "slow" },
			});
		});

		it("parses chained `NOT` (right-associative)", ({ expect }) => {
			const expr = parse("not not slow");

			expect(expr).toEqual({
				type: "not",
				expr: {
					type: "not",
					expr: { type: "identifier", pattern: "slow" },
				},
			});
		});

		it("parses triple `NOT`", ({ expect }) => {
			const expr = parse("not not not slow");

			expect(expr).toEqual({
				type: "not",
				expr: {
					type: "not",
					expr: {
						type: "not",
						expr: { type: "identifier", pattern: "slow" },
					},
				},
			});
		});
	});

	describe("operator precedence", () => {
		it("`NOT` has higher precedence than `AND`", ({ expect }) => {
			const expr = parse("not a and b");

			// `not a and b` should be `(not a) and b`
			expect(expr).toEqual({
				type: "and",
				left: {
					type: "not",
					expr: { type: "identifier", pattern: "a" },
				},
				right: { type: "identifier", pattern: "b" },
			});
		});

		it("`AND` has higher precedence than `OR`", ({ expect }) => {
			const expr = parse("a and b or c");

			// `a and b or c` should be `(a and b) or c`
			expect(expr).toEqual({
				type: "or",
				left: {
					type: "and",
					left: { type: "identifier", pattern: "a" },
					right: { type: "identifier", pattern: "b" },
				},
				right: { type: "identifier", pattern: "c" },
			});
		});

		it("`OR` has lower precedence than `AND`", ({ expect }) => {
			const expr = parse("a or b and c");

			// `a or b and c` should be `a or (b and c)`
			expect(expr).toEqual({
				type: "or",
				left: { type: "identifier", pattern: "a" },
				right: {
					type: "and",
					left: { type: "identifier", pattern: "b" },
					right: { type: "identifier", pattern: "c" },
				},
			});
		});

		it("handles complex precedence", ({ expect }) => {
			const expr = parse("not a and b or c");

			// `not a and b or c` should be `((not a) and b) or c`
			expect(expr).toEqual({
				type: "or",
				left: {
					type: "and",
					left: {
						type: "not",
						expr: { type: "identifier", pattern: "a" },
					},
					right: { type: "identifier", pattern: "b" },
				},
				right: { type: "identifier", pattern: "c" },
			});
		});

		it("handles complex precedence with multiple `AND`s and `OR`s", ({
			expect,
		}) => {
			const expr = parse("a or b and c or d and e");

			// `a or b and c or d and e` should be `a or (b and c) or (d and e)`
			expect(expr).toEqual({
				type: "or",
				left: {
					type: "or",
					left: { type: "identifier", pattern: "a" },
					right: {
						type: "and",
						left: { type: "identifier", pattern: "b" },
						right: { type: "identifier", pattern: "c" },
					},
				},
				right: {
					type: "and",
					left: { type: "identifier", pattern: "d" },
					right: { type: "identifier", pattern: "e" },
				},
			});
		});
	});

	describe("parenthesized expressions", () => {
		it("parses parenthesized identifier", ({ expect }) => {
			const expr = parse("(slow)");

			expect(expr).toEqual({ type: "identifier", pattern: "slow" });
		});

		it("parses parentheses to override precedence", ({ expect }) => {
			const expr = parse("(a or b) and c");

			// `(a or b) and c` - parentheses override normal precedence
			expect(expr).toEqual({
				type: "and",
				left: {
					type: "or",
					left: { type: "identifier", pattern: "a" },
					right: { type: "identifier", pattern: "b" },
				},
				right: { type: "identifier", pattern: "c" },
			});
		});

		it("parses nested parentheses", ({ expect }) => {
			const expr = parse("((a))");

			expect(expr).toEqual({ type: "identifier", pattern: "a" });
		});

		it("parses complex nested parentheses", ({ expect }) => {
			const expr = parse("(a and (b or c))");

			expect(expr).toEqual({
				type: "and",
				left: { type: "identifier", pattern: "a" },
				right: {
					type: "or",
					left: { type: "identifier", pattern: "b" },
					right: { type: "identifier", pattern: "c" },
				},
			});
		});

		it("parses `NOT` with parentheses", ({ expect }) => {
			const expr = parse("not (slow or flaky)");

			expect(expr).toEqual({
				type: "not",
				expr: {
					type: "or",
					left: { type: "identifier", pattern: "slow" },
					right: { type: "identifier", pattern: "flaky" },
				},
			});
		});

		it("handles deeply nested expressions", ({ expect }) => {
			const expr = parse(
				"(((a and b) or (c and d)) and ((e or f) and (g or h)))",
			);

			expect(expr).toEqual({
				type: "and",
				left: {
					type: "or",
					left: {
						type: "and",
						left: {
							pattern: "a",
							type: "identifier",
						},
						right: {
							pattern: "b",
							type: "identifier",
						},
					},
					right: {
						type: "and",
						left: {
							pattern: "c",
							type: "identifier",
						},
						right: {
							pattern: "d",
							type: "identifier",
						},
					},
				},
				right: {
					type: "and",
					left: {
						type: "or",
						left: {
							pattern: "e",
							type: "identifier",
						},
						right: {
							pattern: "f",
							type: "identifier",
						},
					},
					right: {
						type: "or",
						left: {
							pattern: "g",
							type: "identifier",
						},
						right: {
							pattern: "h",
							type: "identifier",
						},
					},
				},
			});
		});
	});

	describe("error handling", () => {
		it("throws on empty input", ({ expect }) => {
			expect(() => parse("")).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Unexpected end of input: expected expression]`,
			);
		});

		it("throws on unexpected AND at start", ({ expect }) => {
			expect(() => parse("and slow")).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Unexpected 'and': missing left operand]`,
			);
		});

		it("throws on unexpected OR at start", ({ expect }) => {
			expect(() => parse("or slow")).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Unexpected 'or': missing left operand]`,
			);
		});

		it("throws on missing right operand for AND", ({ expect }) => {
			expect(() => parse("slow and")).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Unexpected end of input: expected identifier or "("]`,
			);
		});

		it("throws on missing right operand for OR", ({ expect }) => {
			expect(() => parse("slow or")).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Unexpected end of input: expected identifier or "("]`,
			);
		});

		it("throws on missing operand for NOT", ({ expect }) => {
			expect(() => parse("not")).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Unexpected end of input: expected identifier or "("]`,
			);
		});

		it("throws on unmatched opening parenthesis", ({ expect }) => {
			expect(() => parse("(slow and fast")).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Expected ')' after expression]`,
			);
		});

		it("throws on unmatched closing parenthesis", ({ expect }) => {
			expect(() => parse("slow and fast)")).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Unexpected token ')']`,
			);
		});

		it("throws on empty parentheses", ({ expect }) => {
			expect(() => parse("()")).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Unexpected ')': missing opening parenthesis or expression]`,
			);
		});

		it('throws on consecutive operators "and and"', ({ expect }) => {
			expect(() =>
				parse("slow and and fast"),
			).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Unexpected 'and': missing left operand]`,
			);
		});

		it('throws on consecutive operators "or and"', ({ expect }) => {
			expect(() =>
				parse("slow or and fast"),
			).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Unexpected 'and': missing left operand]`,
			);
		});

		it('throws on consecutive operators "and or"', ({ expect }) => {
			expect(() =>
				parse("slow and or fast"),
			).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Unexpected 'or': missing left operand]`,
			);
		});

		it('throws on "slow (integration)" - missing operator', ({ expect }) => {
			expect(() =>
				parse("slow (integration)"),
			).toThrowErrorMatchingInlineSnapshot(
				`[ParseError: Unexpected token '(']`,
			);
		});

		it("provides position information in errors", ({ expect }) => {
			try {
				parse("slow and");

				expect.unreachable("should have thrown");
			} catch (e) {
				expect(e).toBeInstanceOf(ParseError);

				const error = e as ParseError;

				expect(error.position).toBe(8);
				expect(error.line).toBe(1);
			}
		});
	});
});
