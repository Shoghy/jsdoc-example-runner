import fs from "fs";
import { runModuleString } from "./utils.ts";

const Eol = /\r?\n/;
const StartComment = / *\/\*\*/;
const EndComment = /.+\*\//;
const StartExample = / *\* ```[tj]s$/;
const EndExample = / *\* ```$/;
const LineTrimer = /^ *\* ?/;

const CommentReg = / *\/\*\*\r?\n( *\*.*\r?\n)* *\*\//g;

enum State {
  Outside,
  InComment,
  InExample,
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

  const examples: string[] = [];

  const fileCode = fs.readFileSync(path, "utf-8");
  const comments = fileCode.match(CommentReg);
  if (comments === null) {
    return;
  }

  for (const comment of comments) {
    const lines = comment.split(Eol);
    let state = State.Outside as State;
    for (const line of lines) {
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
            examples.push("");
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
          examples[examples.length - 1] += line.replace(LineTrimer, "") + "\n";
          break;
      }
    }
  }

  for (const example of examples) {
    await runModuleString(fileCode + "\n\n" + example, folderPath, fileExt);
  }
}
