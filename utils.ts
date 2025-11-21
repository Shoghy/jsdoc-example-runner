export async function runModuleString(code: string) {
  const blob = new Blob([code], { type: "text/javascript" });
  const moduleUrl = URL.createObjectURL(blob);
  return import(moduleUrl);
}
