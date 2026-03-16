import fs from "node:fs";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { resolvePath } from "../utils/pathResolver.js";

export const calculateHash = async (currentDir, args) => {
  const { input, algorithm = "sha256", save } = args;

  if (!input) {
    console.log("Invalid input");
    return;
  }

  const inputPath = resolvePath(currentDir, input);
  const hash = createHash(algorithm);

  try {
    const readStream = fs.createReadStream(inputPath);
    await pipeline(readStream, hash);
    const result = hash.digest("hex");

    console.log(`${algorithm}: ${result}`);

    if (save) {
      const outputPath = `${inputPath}.${algorithm}`;
      await fs.promises.writeFile(outputPath, result);
    }
  } catch (error) {
    console.log("Operation failed");
  }
};
