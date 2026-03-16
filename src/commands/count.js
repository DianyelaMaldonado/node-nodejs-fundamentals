import fs from "node:fs";
import { resolvePath } from "../utils/pathResolver.js";

export const countFile = async (currentDir, inputArg) => {
  if (!inputArg) {
    console.log("Invalid input");
    return;
  }

  const filePath = resolvePath(currentDir, inputArg);
  let lines = 0;
  let words = 0;
  let characters = 0;

  const readStream = fs.createReadStream(filePath, { encoding: "utf8" });

  try {
    for await (const chunk of readStream) {
      characters += chunk.length;
      lines += (chunk.match(/\n/g) || []).length;
      words += chunk
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
    }

    console.log(`Lines: ${lines}`);
    console.log(`Words: ${words}`);
    console.log(`Characters: ${characters}`);
  } catch (error) {
    console.log("Operation failed");
  }
};
