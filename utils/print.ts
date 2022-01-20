/**
 * Print message for debug
 * @param message message content
 */
 export function printMessageForDebug(message: string): void {
  console.info(`[DEBUG] ${message}`);
}

/**
 * Print message for error
 * @param message message content
 */
export function printMessageForError(response: string|Error) {
  if (typeof response === "string") {
    console.error(`[ERROR] ${response}`);
  } else {
    console.error(`[${response.name}] ${response.message}\n`);
    if (response.stack) {
      console.error('stack ==>');
      console.error(response.stack);
    }
  }
}

/**
 * Print message for notice
 * @param message message content
 */
 export function printMessageForNotice(message: string): void {
  console.info(`[NOTICE] ${message}`);
}