import { hashJson } from "@/app/hashJson";
import { readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const PASTAS_DIR = resolve(process.cwd(), "app/pastas");
const OUTPUT_FILE = resolve(process.cwd(), "app/pastaHashes.generated.ts");

async function main() {
  const files = (await readdir(PASTAS_DIR))
    .filter((file) => file.endsWith(".ts"))
    .sort();

  const output: string[] = ["// AUTO-GENERATED. DO NOT EDIT.", ""];
  for (const file of files) {
    if (!file.endsWith("Ufo.ts")) {
      continue;
    }
    const filePath = resolve(PASTAS_DIR, file);
    const pastaModule = await import(pathToFileURL(filePath).href);

    const exports = Object.entries(pastaModule);
    if (exports.length !== 1) {
      throw new Error(
        `${file} must have exactly one export; found ${exports.length}`,
      );
    }

    const [exportName, pasta] = exports[0];
    const hash = hashJson(JSON.stringify(pasta));
    output.push(`export const ${exportName}_HASH = BigInt("${hash}");`);
  }

  output.push("");

  await writeFile(OUTPUT_FILE, output.join("\n"));

  console.log(`Generated ${OUTPUT_FILE}`);
  console.log(`Processed ${files.length} pastas.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
