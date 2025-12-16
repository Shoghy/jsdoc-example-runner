import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

export async function runModuleString(
  code: string,
  basePath: string,
  ext?: string,
): Promise<[string, unknown]> {
  const rewritten = rewriteImports(code, basePath);
  const tempPath = path.join(
    tmpdir(),
    `temp_${Math.random().toString(36)}${ext !== undefined ? "." + ext : ""}`,
  );

  try {
    await writeFile(tempPath, rewritten);

    await import(`file://${tempPath}`);

    return [tempPath, null];
  } catch (e) {
    return [tempPath, e];
  } finally {
    await unlink(tempPath);
  }
}

function rewriteImports(code: string, basePath: string) {
  return code.replace(
    /import +([^'"]+?) +from +['"](.+?)['"]/g,
    (full, bindings, spec: string) => {
      if (spec.startsWith(".")) {
        const resolved = path.resolve(basePath, spec);
        return `import ${bindings} from "${resolved}"`;
      }
      return full;
    },
  );
}
