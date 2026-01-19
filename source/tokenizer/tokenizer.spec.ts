/** biome-ignore-all lint/style/noNonNullAssertion: we need to access indexes in tests */
import { describe, it } from "vitest";
import { tokenize } from "./tokenizer.ts";

describe("`Tokenizer`", { concurrent: true }, () => {
	describe("identifiers", () => {
		it("tokenizes a simple identifier", ({ expect }) => {
			const tokens = tokenize("slow");

			expect(tokens).toMatchInlineSnapshot(`
			[
			  {
			    "column": 1,
			    "line": 1,
			    "position": 0,
			    "type": "IDENTIFIER",
			    "value": "slow",
			  },
			  {
			    "column": 5,
			    "line": 1,
			    "position": 4,
			    "type": "EOF",
			    "value": "",
			  },
			]
		`);
		});

		it("tokenizes identifier with underscores", ({ expect }) => {
			const tokens = tokenize("linux_amd64");

			expect(tokens[0]).toMatchObject({
				type: "IDENTIFIER",
				value: "linux_amd64",
			});
		});

		it("tokenizes identifier with numbers", ({ expect }) => {
			const tokens = tokenize("test123");

			expect(tokens[0]).toMatchObject({
				type: "IDENTIFIER",
				value: "test123",
			});
		});

		it("handles identifier with dots", ({ expect }) => {
			const tokens = tokenize("com.example.test");

			expect(tokens[0]).toMatchObject({
				type: "IDENTIFIER",
				value: "com.example.test",
			});
		});

		it("handles identifier with colons", ({ expect }) => {
			const tokens = tokenize("test:integration");

			expect(tokens[0]).toMatchObject({
				type: "IDENTIFIER",
				value: "test:integration",
			});
		});

		describe("wildcards", () => {
			it("tokenizes identifier with prefix wildcard", ({ expect }) => {
				const tokens = tokenize("*test");

				expect(tokens[0]).toMatchObject({
					type: "IDENTIFIER",
					value: "*test",
				});
			});

			it("tokenizes identifier with suffix wildcard", ({ expect }) => {
				const tokens = tokenize("test*");

				expect(tokens[0]).toMatchObject({
					type: "IDENTIFIER",
					value: "test*",
				});
			});

			it("tokenizes identifier with middle wildcard", ({ expect }) => {
				const tokens = tokenize("foo*bar");

				expect(tokens[0]).toMatchObject({
					type: "IDENTIFIER",
					value: "foo*bar",
				});
			});

			it("tokenizes identifier with multiple wildcards", ({ expect }) => {
				const tokens = tokenize("a*z*");

				expect(tokens[0]).toMatchObject({
					type: "IDENTIFIER",
					value: "a*z*",
				});
			});

			it("tokenizes standalone wildcard", ({ expect }) => {
				const tokens = tokenize("*");

				expect(tokens[0]).toMatchObject({
					type: "IDENTIFIER",
					value: "*",
				});
			});

			it("tokenizes multiple wildcards only", ({ expect }) => {
				const tokens = tokenize("**");

				expect(tokens[0]).toMatchObject({
					type: "IDENTIFIER",
					value: "**",
				});
			});
		});
	});

	describe("keywords", () => {
		it('tokenizes "and" as AND keyword', ({ expect }) => {
			const tokens = tokenize("and");

			expect(tokens).toMatchInlineSnapshot(`
				[
				  {
				    "column": 1,
				    "line": 1,
				    "position": 0,
				    "type": "AND",
				    "value": "and",
				  },
				  {
				    "column": 4,
				    "line": 1,
				    "position": 3,
				    "type": "EOF",
				    "value": "",
				  },
				]
			`);
		});

		it('tokenizes "or" as OR keyword', ({ expect }) => {
			const tokens = tokenize("or");

			expect(tokens).toMatchInlineSnapshot(`
				[
				  {
				    "column": 1,
				    "line": 1,
				    "position": 0,
				    "type": "OR",
				    "value": "or",
				  },
				  {
				    "column": 3,
				    "line": 1,
				    "position": 2,
				    "type": "EOF",
				    "value": "",
				  },
				]
			`);
		});

		it('tokenizes "not" as NOT keyword', ({ expect }) => {
			const tokens = tokenize("not");

			expect(tokens).toMatchInlineSnapshot(`
				[
				  {
				    "column": 1,
				    "line": 1,
				    "position": 0,
				    "type": "NOT",
				    "value": "not",
				  },
				  {
				    "column": 4,
				    "line": 1,
				    "position": 3,
				    "type": "EOF",
				    "value": "",
				  },
				]
			`);
		});

		describe.for([
			createCapitalizationTestCases("and", "AND"),
			createCapitalizationTestCases("or", "OR"),
			createCapitalizationTestCases("not", "NOT"),
		])("case insensitivity (%s)", ([keyword, cases]) => {
			it.for(cases)('tokenizes "%s"', (input, { expect }) => {
				const tokens = tokenize(input);

				expect(tokens[0]?.value).toBe(input);
				expect(tokens[0]?.type).toBe(keyword);
			});
		});
	});

	describe("parentheses", () => {
		it("tokenizes left parenthesis", ({ expect }) => {
			const tokens = tokenize("(");

			expect(tokens).toMatchInlineSnapshot(`
				[
				  {
				    "column": 1,
				    "line": 1,
				    "position": 0,
				    "type": "LEFT_PAREN",
				    "value": "(",
				  },
				  {
				    "column": 2,
				    "line": 1,
				    "position": 1,
				    "type": "EOF",
				    "value": "",
				  },
				]
			`);
		});

		it("tokenizes right parenthesis", ({ expect }) => {
			const tokens = tokenize(")");

			expect(tokens).toMatchInlineSnapshot(`
				[
				  {
				    "column": 1,
				    "line": 1,
				    "position": 0,
				    "type": "RIGHT_PAREN",
				    "value": ")",
				  },
				  {
				    "column": 2,
				    "line": 1,
				    "position": 1,
				    "type": "EOF",
				    "value": "",
				  },
				]
			`);
		});

		it("tokenizes nested parentheses", ({ expect }) => {
			const tokens = tokenize("(())");

			expect(tokens).toHaveLength(5);
			expect(tokens[0]!.type).toBe("LEFT_PAREN");
			expect(tokens[1]!.type).toBe("LEFT_PAREN");
			expect(tokens[2]!.type).toBe("RIGHT_PAREN");
			expect(tokens[3]!.type).toBe("RIGHT_PAREN");
			expect(tokens[4]!.type).toBe("EOF");
		});
	});

	describe("empty input", () => {
		it("returns only EOF token for empty string", ({ expect }) => {
			const tokens = tokenize("");

			expect(tokens).toMatchInlineSnapshot(`
				[
				  {
				    "column": 1,
				    "line": 1,
				    "position": 0,
				    "type": "EOF",
				    "value": "",
				  },
				]
			`);
		});

		it("returns only EOF token for whitespace-only input", ({ expect }) => {
			const tokens = tokenize("   \t\n  ");

			expect(tokens).toMatchInlineSnapshot(`
				[
				  {
				    "column": 3,
				    "line": 2,
				    "position": 7,
				    "type": "EOF",
				    "value": "",
				  },
				]
			`);
		});
	});

	describe("complex expressions", () => {
		it('tokenizes "slow and integration"', ({ expect }) => {
			const tokens = tokenize("slow and integration");

			expect(tokens).toHaveLength(4);
			expect(tokens.map((t) => [t.type, t.value])).toEqual([
				["IDENTIFIER", "slow"],
				["AND", "and"],
				["IDENTIFIER", "integration"],
				["EOF", ""],
			]);
		});

		it('tokenizes "slow and not integration"', ({ expect }) => {
			const tokens = tokenize("slow and not integration");

			expect(tokens).toHaveLength(5);
			expect(tokens.map((t) => [t.type, t.value])).toEqual([
				["IDENTIFIER", "slow"],
				["AND", "and"],
				["NOT", "not"],
				["IDENTIFIER", "integration"],
				["EOF", ""],
			]);
		});

		it('tokenizes "slow and (*integration or a*z*)"', ({ expect }) => {
			const tokens = tokenize("slow and (*integration or a*z*)");

			expect(tokens).toHaveLength(8);
			expect(tokens.map((t) => [t.type, t.value])).toEqual([
				["IDENTIFIER", "slow"],
				["AND", "and"],
				["LEFT_PAREN", "("],
				["IDENTIFIER", "*integration"],
				["OR", "or"],
				["IDENTIFIER", "a*z*"],
				["RIGHT_PAREN", ")"],
				["EOF", ""],
			]);
		});

		it('tokenizes "not (slow or flaky)"', ({ expect }) => {
			const tokens = tokenize("not (slow or flaky)");

			expect(tokens).toHaveLength(7);
			expect(tokens.map((t) => [t.type, t.value])).toEqual([
				["NOT", "not"],
				["LEFT_PAREN", "("],
				["IDENTIFIER", "slow"],
				["OR", "or"],
				["IDENTIFIER", "flaky"],
				["RIGHT_PAREN", ")"],
				["EOF", ""],
			]);
		});

		it("tokenizes deeply nested expression", ({ expect }) => {
			const tokens = tokenize("((a and b) or (c and d))");

			expect(tokens.map((t) => [t.type, t.value])).toEqual([
				["LEFT_PAREN", "("],
				["LEFT_PAREN", "("],
				["IDENTIFIER", "a"],
				["AND", "and"],
				["IDENTIFIER", "b"],
				["RIGHT_PAREN", ")"],
				["OR", "or"],
				["LEFT_PAREN", "("],
				["IDENTIFIER", "c"],
				["AND", "and"],
				["IDENTIFIER", "d"],
				["RIGHT_PAREN", ")"],
				["RIGHT_PAREN", ")"],
				["EOF", ""],
			]);
		});
	});

	describe("whitespace handling", () => {
		it("handles spaces between tokens", ({ expect }) => {
			const tokens = tokenize("slow and fast");

			expect(tokens).toHaveLength(4);
			expect(tokens[0]).toMatchObject({ type: "IDENTIFIER", value: "slow" });
			expect(tokens[1]).toMatchObject({ type: "AND", value: "and" });
			expect(tokens[2]).toMatchObject({ type: "IDENTIFIER", value: "fast" });
			expect(tokens[3]).toMatchObject({ type: "EOF", value: "" });
		});

		it("handles tabs between tokens", ({ expect }) => {
			const tokens = tokenize("slow\tand\tfast");

			expect(tokens).toHaveLength(4);
			expect(tokens[0]).toMatchObject({ type: "IDENTIFIER", value: "slow" });
			expect(tokens[1]).toMatchObject({ type: "AND", value: "and" });
			expect(tokens[2]).toMatchObject({ type: "IDENTIFIER", value: "fast" });
			expect(tokens[3]).toMatchObject({ type: "EOF", value: "" });
		});

		it("handles newlines between tokens", ({ expect }) => {
			const tokens = tokenize("slow\nand\nfast");

			expect(tokens).toHaveLength(4);
			expect(tokens[0]).toMatchObject({ type: "IDENTIFIER", value: "slow" });
			expect(tokens[1]).toMatchObject({ type: "AND", value: "and" });
			expect(tokens[2]).toMatchObject({ type: "IDENTIFIER", value: "fast" });
			expect(tokens[3]).toMatchObject({ type: "EOF", value: "" });
		});

		it("handles multiple whitespace characters", ({ expect }) => {
			const tokens = tokenize("slow   and  \t\n  fast");

			expect(tokens).toHaveLength(4);
			expect(tokens[0]).toMatchObject({ type: "IDENTIFIER", value: "slow" });
			expect(tokens[1]).toMatchObject({ type: "AND", value: "and" });
			expect(tokens[2]).toMatchObject({ type: "IDENTIFIER", value: "fast" });
			expect(tokens[3]).toMatchObject({ type: "EOF", value: "" });
		});

		it("handles leading whitespace", ({ expect }) => {
			const tokens = tokenize("   slow");

			expect(tokens).toHaveLength(2);
			expect(tokens[0]).toMatchObject({ type: "IDENTIFIER", value: "slow" });
			expect(tokens[1]).toMatchObject({ type: "EOF", value: "" });
		});

		it("handles trailing whitespace", ({ expect }) => {
			const tokens = tokenize("slow   ");

			expect(tokens).toHaveLength(2);
			expect(tokens[0]).toMatchObject({ type: "IDENTIFIER", value: "slow" });
			expect(tokens[1]).toMatchObject({ type: "EOF", value: "" });
		});

		it("handles Windows-style line endings (CRLF)", ({ expect }) => {
			const tokens = tokenize("slow\r\nand\r\nfast");

			expect(tokens).toHaveLength(4);
			expect(tokens[0]).toMatchObject({ type: "IDENTIFIER", value: "slow" });
			expect(tokens[1]).toMatchObject({ type: "AND", value: "and" });
			expect(tokens[2]).toMatchObject({ type: "IDENTIFIER", value: "fast" });
			expect(tokens[3]).toMatchObject({ type: "EOF", value: "" });
		});
	});

	describe("edge cases", () => {
		it.for([
			"android",
			"organization",
			"nothing",
		])('handles identifier that starts like keyword "%s"', (word, {
			expect,
		}) => {
			const tokens = tokenize(word);

			expect(tokens[0]).toMatchObject({
				type: "IDENTIFIER",
				value: word,
			});
		});

		it("handles parentheses directly adjacent to identifiers", ({ expect }) => {
			const tokens = tokenize("(slow)");

			expect(tokens).toHaveLength(4);
			expect(tokens[0]).toMatchObject({ type: "LEFT_PAREN", value: "(" });
			expect(tokens[1]).toMatchObject({ type: "IDENTIFIER", value: "slow" });
			expect(tokens[2]).toMatchObject({ type: "RIGHT_PAREN", value: ")" });
			expect(tokens[3]).toMatchObject({ type: "EOF", value: "" });
		});
	});
});

const createCapitalizationTestCases = (
	input: string,
	keyword: string,
): [string, string[]] => [keyword, Array.from(capitalizedVariations(input))];

function* capitalizedVariations(word: string): Generator<string, void, void> {
	const n = word.length;
	const total = 1 << n;

	for (let mask = 1; mask < total; mask++) {
		let variation = "";
		for (let i = 0; i < n; i++) {
			variation +=
				mask & (1 << i) ? word[i]!.toUpperCase() : word[i]!.toLowerCase();
		}

		yield variation;
	}
}
