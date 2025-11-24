import { runModuleString } from "./utils.ts";

const Eol = /\r?\n/;
const StartComment = / *\/\*\*/;
const EndComment = /.+\*\//;
const StartExample = / *\* ```(t|j)s$/;
const EndExample = / *\* ```$/;
const LineTrimer = /^ *\* ?/;

const CommentReg = / *\/\*\*\r?\n( *\*.*\r?\n)* *\*\//g;

enum State {
  Outside,
  InComment,
  InExample,
}

export async function runExamplesInFile(path: string) {
  if (!path.startsWith(".") && !path.startsWith("/")) {
    throw new Error("Path must start with `.` or `/`");
  }

  const absolutePath = import.meta.resolve(path).substring(7);
  const file = Bun.file(absolutePath);
  if (!(await file.exists())) {
    throw new Error("Path is not a file");
  }

  const segmentedPath = absolutePath.split("/");
  segmentedPath.pop();
  const folderPath = segmentedPath.join("/");

  const examples: string[] = [];

  const fileCode = await file.text();
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
    runModuleString(fileCode + "\n\n" + example, folderPath);
  }
}
