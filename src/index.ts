import fs from "fs";
import { runModuleString } from "./utils.ts";

const Eol = /\r?\n/;
const StartComment = / *\/\*\*/;
const EndComment = /.+\*\//;
const StartExample = / *\* ```[tj]s$/;
const EndExample = / *\* ```$/;
const LineTrimer = /^ *\* ?/;

enum State {
  Outside,
  InComment,
  InExample,
}

interface Example {
  startLine: number;
  code: string;
}

export async function runExamplesInFile(path: string) {
  if (!fs.existsSync(path)) {
    throw new Error("File doesn't exists");
  }
  if (fs.lstatSync(path).isDirectory()) {
    throw new Error("Path is not a file");
  }

  const segmentedPath = path.split("/");
  const fileExt = segmentedPath.pop()?.split(".").pop();
  const folderPath = segmentedPath.join("/");

  const examples: Example[] = [];

  const fileCode = fs.readFileSync(path, "utf-8");
  const lines = fileCode.split(Eol);

  let state = State.Outside as State;
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];

    switch (state) {
      case State.Outside:
        if (StartComment.test(line)) {
          state = State.InComment;
        }
        break;

      case State.InComment:
        if (EndComment.test(line)) {
          state = State.Outside;
          continue;
        }
        if (StartExample.test(line)) {
          state = State.InExample;
          examples.push({ code: "", startLine: i });
        }
        break;
      case State.InExample:
        if (EndComment.test(line)) {
          state = State.Outside;
          continue;
        }
        if (EndExample.test(line)) {
          state = State.InComment;
          continue;
        }

        examples[examples.length - 1].code +=
          line.replace(LineTrimer, "") + "\n";
        break;
    }
  }

  if (examples.length === 0) {
    throw new Error("No examples were found");
  }

  for (const example of examples) {
    const result = await runModuleString(
      fileCode + "\n\n" + example.code,
      folderPath,
      fileExt,
    );

    const [tempPath, error] = result;
    if (error === null) {
      continue;
    }

    if (!(error instanceof Error) || error.stack === undefined) {
      throw error;
    }

    const stackLines = error.stack.split("\n");
    const lineIndex = stackLines.findIndex((line) => line.includes(tempPath));
    if (lineIndex > -1) {
      const parts = stackLines[lineIndex].split(":");
      parts.pop();
      const lineStrNumber = parts.pop();
      if (lineStrNumber !== undefined) {
        const lineNumber =
          example.startLine + parseInt(lineStrNumber, 10) - lines.length;
        stackLines[lineIndex] = `    at ${path}:${lineNumber}`;
      } else {
        stackLines[lineIndex] = `    at ${path}:${example.startLine + 1}`;
      }
    }

    // eslint-disable-next-line no-console
    console.log(stackLines.join("\n"));

    throw "";
  }
}
