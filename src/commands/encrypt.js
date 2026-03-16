import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { scrypt, randomBytes, createCipheriv } from "node:crypto";
import { promisify } from "node:util";
import { resolvePath } from "../utils/pathResolver.js";

const scryptAsync = promisify(scrypt);

export const encryptFile = async (currentDir, args) => {
  const { input, output, password } = args;
  if (!input || !output || !password) return console.log("Invalid input");

  try {
    const inputPath = resolvePath(currentDir, input);
    const outputPath = resolvePath(currentDir, output);

    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const key = await scryptAsync(password, salt, 32);

    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const readStream = createReadStream(inputPath);
    const writeStream = createWriteStream(outputPath);

    writeStream.write(salt);
    writeStream.write(iv);

    await pipeline(readStream, cipher, writeStream);

    const authTag = cipher.getAuthTag();
    const tagStream = createWriteStream(outputPath, { flags: "a" });
    tagStream.write(authTag);
    tagStream.end();

    console.log("Encryption successful!");
  } catch (err) {
    console.log("Operation failed");
  }
};
