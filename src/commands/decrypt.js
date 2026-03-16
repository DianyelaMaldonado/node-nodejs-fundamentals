import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { scrypt, createDecipheriv } from "node:crypto";
import { promisify } from "node:util";
import { resolvePath } from "../utils/pathResolver.js";

const scryptAsync = promisify(scrypt);

export const decryptFile = async (currentDir, args) => {
  const { input, output, password } = args;
  if (!input || !output || !password) return console.log("Invalid input");

  try {
    const inputPath = resolvePath(currentDir, input);
    const outputPath = resolvePath(currentDir, output);

    // Read headers (salt + iv = 28 bytes) manually first
    const fd = await fs.promises.open(inputPath, "r");
    const headerBuffer = Buffer.alloc(28);
    await fd.read(headerBuffer, 0, 28, 0);

    const salt = headerBuffer.slice(0, 16);
    const iv = headerBuffer.slice(16, 28);

    // Get Auth Tag from the last 16 bytes
    const stats = await fd.stat();
    const tagBuffer = Buffer.alloc(16);
    await fd.read(tagBuffer, 0, 16, stats.size - 16);
    await fd.close();

    const key = await scryptAsync(password, salt, 32);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tagBuffer);

    // Decrypt the middle part using streams
    const readStream = fs.createReadStream(inputPath, {
      start: 28,
      end: stats.size - 17,
    });
    const writeStream = fs.createWriteStream(outputPath);

    await pipeline(readStream, decipher, writeStream);

    console.log("Decryption successful!");
  } catch (err) {
    console.log("Operation failed");
  }
};
