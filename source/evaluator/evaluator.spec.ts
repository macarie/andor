import { describe, it } from "vitest";
import { and, identifier, not, or } from "../ast/factory.ts";
import { parse } from "../parser/parser.ts";
import { evaluate } from "./evaluator.ts";

describe("`ExpressionEvaluator`", { concurrent: true }, () => {
	describe("identifier expressions", () => {
		it("returns `true` if entity matches exactly", ({ expect }) => {
			const expr = identifier("slow");

			expect(evaluate(expr, ["slow"])).toBe(true);
		});

		it("returns `false` if no entity matches", ({ expect }) => {
			const expr = identifier("slow");

			expect(evaluate(expr, ["fast", "integration"])).toBe(false);
		});

		it("returns `true` if any entity matches", ({ expect }) => {
			const expr = identifier("slow");

			expect(evaluate(expr, ["fast", "slow", "integration"])).toBe(true);
		});

		it("returns `false` for empty entity list", ({ expect }) => {
			const expr = identifier("slow");

			expect(evaluate(expr, [])).toBe(false);
		});
	});

	describe("`AND` expressions", () => {
		it("returns `true` when both sides match", ({ expect }) => {
			const expr = and(identifier("slow"), identifier("integration"));

			expect(evaluate(expr, ["slow", "integration"])).toBe(true);
		});

		it("returns `false` when left side does not match", ({ expect }) => {
			const expr = and(identifier("slow"), identifier("integration"));

			expect(evaluate(expr, ["fast", "integration"])).toBe(false);
		});

		it("returns `false` when right side does not match", ({ expect }) => {
			const expr = and(identifier("slow"), identifier("integration"));

			expect(evaluate(expr, ["slow", "unit"])).toBe(false);
		});

		it("returns `false` when neither side matches", ({ expect }) => {
			const expr = and(identifier("slow"), identifier("integration"));

			expect(evaluate(expr, ["fast", "unit"])).toBe(false);
		});

		it("handles chained `AND`", ({ expect }) => {
			const expr = parse("a and b and c");

			expect(evaluate(expr, ["a", "b", "c"])).toBe(true);
			expect(evaluate(expr, ["a", "b"])).toBe(false);
			expect(evaluate(expr, ["a", "c"])).toBe(false);
		});
	});

	describe("`OR` expressions", () => {
		it("returns `true` when both sides match", ({ expect }) => {
			const expr = or(identifier("slow"), identifier("fast"));

			expect(evaluate(expr, ["slow", "fast"])).toBe(true);
		});

		it("returns `true` when only left side matches", ({ expect }) => {
			const expr = or(identifier("slow"), identifier("fast"));

			expect(evaluate(expr, ["slow"])).toBe(true);
		});

		it("returns `true` when only right side matches", ({ expect }) => {
			const expr = or(identifier("slow"), identifier("fast"));

			expect(evaluate(expr, ["fast"])).toBe(true);
		});

		it("returns `false` when neither side matches", ({ expect }) => {
			const expr = or(identifier("slow"), identifier("fast"));

			expect(evaluate(expr, ["medium"])).toBe(false);
		});

		it("handles chained `OR`", ({ expect }) => {
			const expr = parse("a or b or c");

			expect(evaluate(expr, ["a"])).toBe(true);
			expect(evaluate(expr, ["b"])).toBe(true);
			expect(evaluate(expr, ["c"])).toBe(true);
			expect(evaluate(expr, ["d"])).toBe(false);
		});
	});

	describe("`NOT` expressions", () => {
		it("returns `true` when entity does not match", ({ expect }) => {
			const expr = not(identifier("slow"));

			expect(evaluate(expr, ["fast"])).toBe(true);
		});

		it("returns `false` when entity matches", ({ expect }) => {
			const expr = not(identifier("slow"));

			expect(evaluate(expr, ["slow"])).toBe(false);
		});

		it("returns `true` for empty entity list", ({ expect }) => {
			const expr = not(identifier("slow"));

			expect(evaluate(expr, [])).toBe(true);
		});

		it("handles double `NOT`", ({ expect }) => {
			const expr = parse("not not slow");

			expect(evaluate(expr, ["slow"])).toBe(true);
			expect(evaluate(expr, ["fast"])).toBe(false);
		});
	});

	describe("complex expressions", () => {
		it('evaluates "slow and not integration"', ({ expect }) => {
			const expr = parse("slow and not integration");

			expect(evaluate(expr, ["slow"])).toBe(true);
			expect(evaluate(expr, ["slow", "unit"])).toBe(true);
			expect(evaluate(expr, ["slow", "integration"])).toBe(false);
			expect(evaluate(expr, ["fast"])).toBe(false);
		});

		it('evaluates "not (slow or flaky)"', ({ expect }) => {
			const expr = parse("not (slow or flaky)");

			expect(evaluate(expr, ["fast", "stable"])).toBe(true);
			expect(evaluate(expr, ["slow"])).toBe(false);
			expect(evaluate(expr, ["flaky"])).toBe(false);
			expect(evaluate(expr, ["slow", "flaky"])).toBe(false);
		});

		it('evaluates "(a or b) and (c or d)"', ({ expect }) => {
			const expr = parse("(a or b) and (c or d)");

			expect(evaluate(expr, ["a", "c"])).toBe(true);
			expect(evaluate(expr, ["a", "d"])).toBe(true);
			expect(evaluate(expr, ["b", "c"])).toBe(true);
			expect(evaluate(expr, ["b", "d"])).toBe(true);
			expect(evaluate(expr, ["a", "e"])).toBe(false);
			expect(evaluate(expr, ["e", "c"])).toBe(false);
		});
	});
});
