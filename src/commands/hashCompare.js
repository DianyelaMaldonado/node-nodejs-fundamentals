import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { resolvePath } from "../utils/pathResolver.js";

export const hashCompare = async (currentDir, args) => {
  const { input, hash: hashFile, algorithm = "sha256" } = args;

  if (!input || !hashFile) {
    console.log("Invalid input");
    return;
  }

  try {
    const inputPath = resolvePath(currentDir, input);
    const hashFilePath = resolvePath(currentDir, hashFile);
    const hasher = createHash(algorithm);
    await pipeline(createReadStream(inputPath), hasher);
    const actualHash = hasher.digest("hex");
    const expectedHash = (await fs.readFile(hashFilePath, "utf8")).trim();

    if (actualHash.toLowerCase() === expectedHash.toLowerCase()) {
      console.log("OK");
    } else {
      console.log("MISMATCH");
    }
  } catch (error) {
    console.log("Operation failed");
  }
};
