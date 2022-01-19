import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
// Util
import { printMessageForError } from "./print";

const CONFIG_DIR: string = join(__dirname, "../configs");

/**
 * Create a hash id for use in cdk
 * @param context context
 * @returns created hash id
 */
export function createHashId(context: string): string {
  return `TOV${createHash("sha256").update(context).digest("hex")}`;
}

/**
 * Load a json data (configuration)
 * @param filename file name
 * @returns loaded data
 */
export function loadJsonFile(filename: string) {
  try {
    // Create file path
    const filePath: string = join(CONFIG_DIR, `${filename}.json`);
    // Read a file ata
    const data = readFileSync(filePath).toString();
    // Transform to json and return data
    return JSON.parse(data);
  } catch (err) {
    if (typeof err === "string") {
      printMessageForError(err)
    } else if (err instanceof Error) {
      printMessageForError(err.message);
    }
    // Exit
    process.exit(1);
  }
}