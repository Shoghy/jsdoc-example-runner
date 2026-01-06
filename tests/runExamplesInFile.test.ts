import { writeFile, mkdir, rm } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { test, expect, beforeEach, afterEach } from "bun:test";
import { runExamplesInFile } from "../src/index.ts";

const TEST_DIR = path.join(__dirname, "temp_test_files");

beforeEach(async () => {
  if (existsSync(TEST_DIR)) {
    await rm(TEST_DIR, { recursive: true, force: true });
  }
  await mkdir(TEST_DIR, { recursive: true });
});

afterEach(async () => {
  if (existsSync(TEST_DIR)) {
    await rm(TEST_DIR, { recursive: true, force: true });
  }
});

test("throws error when file doesn't exist", async () => {
  const nonExistentPath = path.join(TEST_DIR, "nonexistent.ts");
  expect(runExamplesInFile(nonExistentPath)).rejects.toThrow(
    "File doesn't exists",
  );
});

test("throws error when path is a directory", async () => {
  expect(runExamplesInFile(TEST_DIR)).rejects.toThrow("Path is not a file");
});

test("throws error when no examples are found", async () => {
  const filePath = path.join(TEST_DIR, "no-examples.ts");
  await writeFile(
    filePath,
    `/**
 * This is a comment without examples
 */
export function foo() {}
`,
  );

  expect(runExamplesInFile(filePath)).rejects.toThrow("No examples were found");
});

test("runs single example successfully", async () => {
  const filePath = path.join(TEST_DIR, "single-example.ts");
  await writeFile(
    filePath,
    `/**
 * \`\`\`ts
 * expect(1 + 1).toBe(2);
 * \`\`\`
 */
export function add(a: number, b: number) {
  return a + b;
}
`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("runs multiple examples in sequence", async () => {
  const filePath = path.join(TEST_DIR, "multiple-examples.ts");
  await writeFile(
    filePath,
    `/**
 * \`\`\`ts
 * expect(1).toBe(1);
 * \`\`\`
 */
export function first() {}

/**
 * \`\`\`ts
 * expect(2).toBe(2);
 * \`\`\`
 */
export function second() {}
`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("handles JavaScript examples", async () => {
  const filePath = path.join(TEST_DIR, "js-example.ts");
  await writeFile(
    filePath,
    `/**
 * \`\`\`js
 * expect(1 + 1).toBe(2);
 * \`\`\`
 */
export function add(a, b) {
  return a + b;
}
`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("handles examples with indentation", async () => {
  const filePath = path.join(TEST_DIR, "indented-example.ts");
  await writeFile(
    filePath,
    `/**
 * \`\`\`ts
 *   const x = 1;
 *   expect(x).toBe(1);
 * \`\`\`
 */
export function test() {}
`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("handles examples with asterisk prefix in comment lines", async () => {
  const filePath = path.join(TEST_DIR, "asterisk-example.ts");
  await writeFile(
    filePath,
    `/**
 * \`\`\`ts
 * expect(1).toBe(1);
 * \`\`\`
 */
export function test() {}
`,
  );

  // Should not throw - asterisks in comment lines are trimmed
  await runExamplesInFile(filePath);
});

test("handles examples spanning multiple lines", async () => {
  const filePath = path.join(TEST_DIR, "multiline-example.ts");
  await writeFile(
    filePath,
    `/**
 * \`\`\`ts
 * const a = 1;
 * const b = 2;
 * const result = a + b;
 * expect(result).toBe(3);
 * \`\`\`
 */
export function add(a: number, b: number) {
  return a + b;
}
`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("handles examples that use functions from the file", async () => {
  const filePath = path.join(TEST_DIR, "function-usage.ts");
  await writeFile(
    filePath,
    `/**
 * \`\`\`ts
 * expect(multiply(2, 3)).toBe(6);
 * \`\`\`
 */
export function multiply(a: number, b: number): number {
  return a * b;
}
`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("handles examples with syntax errors", async () => {
  const filePath = path.join(TEST_DIR, "syntax-error.ts");
  await writeFile(
    filePath,
    `/**
 * \`\`\`ts
 * const x = ;
 * \`\`\`
 */
export function test() {}
`,
  );

  // Should throw - syntax errors may throw the error itself or empty string
  // depending on whether the error has a stack property
  expect(runExamplesInFile(filePath)).rejects.toThrow();
});

test("handles examples after regular comments", async () => {
  const filePath = path.join(TEST_DIR, "after-comment.ts");
  await writeFile(
    filePath,
    `// Regular comment
/**
 * \`\`\`ts
 * expect(1).toBe(1);
 * \`\`\`
 */
export function test() {}
`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("handles examples with empty code blocks", async () => {
  const filePath = path.join(TEST_DIR, "empty-example.ts");
  await writeFile(
    filePath,
    `/**
 * \`\`\`ts
 * \`\`\`
 */
export function test() {}
`,
  );

  // Should not throw (empty example is valid)
  await runExamplesInFile(filePath);
});

test("handles examples in files with different extensions", async () => {
  const filePath = path.join(TEST_DIR, "example.js");
  await writeFile(
    filePath,
    `/**
 * \`\`\`ts
 * expect(1).toBe(1);
 * \`\`\`
 */
export function test() {}
`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("handles examples with complex JSDoc structure", async () => {
  const filePath = path.join(TEST_DIR, "complex-jsdoc.ts");
  await writeFile(
    filePath,
    `/**
 * This is a function that does something.
 *
 * @param x - The first parameter
 * @param y - The second parameter
 * @returns The result
 *
 * \`\`\`ts
 * expect(calculate(2, 3)).toBe(5);
 * \`\`\`
 */
export function calculate(x: number, y: number): number {
  return x + y;
}
`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("handles examples that end comment block", async () => {
  const filePath = path.join(TEST_DIR, "example-ends-comment.ts");
  await writeFile(
    filePath,
    `/**
 * \`\`\`ts
 * expect(1).toBe(1);
 * \`\`\`
 */
export function test() {}
`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("handles multiple examples in same comment block", async () => {
  const filePath = path.join(TEST_DIR, "multiple-in-same-comment.ts");
  await writeFile(
    filePath,
    `/**
 * First example:
 * \`\`\`ts
 * expect(1).toBe(1);
 * \`\`\`
 *
 * Second example:
 * \`\`\`ts
 * expect(2).toBe(2);
 * \`\`\`
 */
export function test() {}
`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("handles examples with Windows line endings", async () => {
  const filePath = path.join(TEST_DIR, "windows-eol.ts");
  await writeFile(
    filePath,
    `/**\r\n * \`\`\`ts\r\n * expect(1).toBe(1);\r\n * \`\`\`\r\n */\r\nexport function test() {}\r\n`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("handles examples with Unix line endings", async () => {
  const filePath = path.join(TEST_DIR, "unix-eol.ts");
  await writeFile(
    filePath,
    `/**\n * \`\`\`ts\n * expect(1).toBe(1);\n * \`\`\`\n */\nexport function test() {}\n`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});

test("handles examples that reference imported modules", async () => {
  const helperPath = path.join(TEST_DIR, "helper.ts");
  await writeFile(
    helperPath,
    `export function helper() {
  return 42;
}
`,
  );

  const filePath = path.join(TEST_DIR, "with-import.ts");
  await writeFile(
    filePath,
    `import { helper } from "./helper.ts";

/**
 * \`\`\`ts
 * expect(helper()).toBe(42);
 * \`\`\`
 */
export function test() {}
`,
  );

  // Should not throw
  await runExamplesInFile(filePath);
});
