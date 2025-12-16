import path from "path";
import { test } from "bun:test";
import { runExamplesInFile } from "../src/index.ts";

test("Simple sum", async () => {
  await runExamplesInFile(path.join(__dirname, "sum.ts"));
});
