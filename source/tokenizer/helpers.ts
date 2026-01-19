/** Checks if a character is whitespace */
export const isWhitespace = (char: string | null): boolean =>
	char === " " || char === "\t" || char === "\n" || char === "\r";
