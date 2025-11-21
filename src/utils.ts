export async function runModuleString(code: string, basePath: string) {
  const rewritten = rewriteImports(code, basePath);
  const blob = new Blob([rewritten], { type: "text/javascript" });
  const moduleUrl = URL.createObjectURL(blob);
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
