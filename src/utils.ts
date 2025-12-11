export async function runModuleString(code: string, basePath: string) {
  const rewritten = rewriteImports(code, basePath);
  const base64 = Buffer.from(rewritten).toString("base64");
  const moduleUrl = `data:text/javascript;base64,${base64}`;
  return import(moduleUrl);
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
