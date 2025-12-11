import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

export async function runModuleString(
  code: string,
  basePath: string,
  ext?: string,
) {
  const rewritten = rewriteImports(code, basePath);
  const tempPath = path.join(
    tmpdir(),
    `temp_${Math.random().toString(36)}${ext !== undefined ? "." + ext : ""}`,
  );
  writeFile(tempPath, rewritten);
  return import(`file://${tempPath}`);
}

function rewriteImports(code: string, basePath: string) {
  return code.replace(
    /import +([^'"]+?) +from +['"](.+?)['"]/g,
    (full, bindings, spec: string) => {
      if (spec.startsWith(".")) {
        return `import ${bindings} from "${basePath + spec.substring(1)}"`;
      }
      return full;
    },
  );
}
