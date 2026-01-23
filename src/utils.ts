import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function runModuleString(
  code: string,
  basePath: string,
  ext?: string,
): Promise<[string, unknown]> {
  const tempPath = path.join(
    basePath,
    `temp_${Math.random().toString(36)}${ext !== undefined ? "." + ext : ""}`,
  );

  try {
    await writeFile(tempPath, code);

    await import(`file://${tempPath}`);

    return [tempPath, null];
  } catch (e) {
    return [tempPath, e];
  } finally {
    await unlink(tempPath);
  }
}
