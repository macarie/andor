# Usage

```ts
import { evaluate, parse } from "@macarie/andor";

const expression = parse("slow and not integration");

expect(evaluate(expression, ["slow", "unit"])).toBe(true);
```

```ts
import { createEvaluator, parse } from "@macarie/andor";

const expression = parse("slow and not integration");
const evaluate = createEvaluator(expression);

expect(evaluate(["slow", "unit"])).toBe(true);
```
