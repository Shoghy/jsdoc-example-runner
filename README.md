# jsdoc-example-runner

Run embedded code examples from JSDoc comments as real tests.

`jsdoc-example-runner` scans a source file, extracts code blocks inside JSDoc comments, and executes them in the same module context as the file they came from. This makes your documentation examples executable and ensures they always stay in sync with your actual code.

## ✨ Features

- ▶️ Executes ts or js code blocks from /\*_ ... _/ JSDoc comments

- 🔍 Automatically extracts fenced code examples:

````ts
/**
 * ```ts
 * console.log(sum(1, 2));
 * ```
 */
export function sum(a: number, b: number): number {
  return a + b;
}
````

- 📄 Runs examples by appending them to the original file's module scope

- 🧪 Ensure the examples are updated with the code

- 🛠 Supports TypeScript or JavaScript files

## 📘 Example Usage

Suppose you have a simple utility with JSDoc-embedded examples:

`sum.ts`

````ts
/**
 * ```ts
 * expect(sum(1, 2)).toBe(3);
 * expect(sum(5, -3)).toBe(2);
 * ```
 */
export function sum(a: number, b: number): number {
  return a + b;
}
````

Then create a small script to run the documentation examples:

`sum.test.ts`

```ts
import path from "path";
import { runExamplesInFile } from "jsdoc-example-runner";
import { test } from "bun:test";

test("Simple sum", async () => {
  await runExamplesInFile(path.resolve(import.meta.path, "path/to/sum.ts"));
});
```

## ⚠️ Notes & Limitations

- Examples must be fenced inside JSDoc comments using backticks
  (` ```ts ` or ` ```js `).

- Code is executed _as-is_ using whatever runtime runModuleString provides.

- Examples run sequentially, in the order they appear.

- Return values are not captured — use assertions for verification.
