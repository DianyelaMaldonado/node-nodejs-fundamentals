import fs from "node:fs";
import { resolvePath } from "../utils/pathResolver.js";

export const jsonToCsv = async (currentDir, input, output) => {
  if (!input || !output) return console.log("Invalid input");

  const inputPath = resolvePath(currentDir, input);
  const outputPath = resolvePath(currentDir, output);

  try {
    const content = await fs.promises.readFile(inputPath, "utf8");
    const data = JSON.parse(content);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid data");
    }

    const headers = Object.keys(data[0]);
    const writeStream = fs.createWriteStream(outputPath);

    // Write headers
    writeStream.write(headers.join(",") + "\n");

    // Stream the rows to the file
    for (const obj of data) {
      const row = headers.map((header) => obj[header] ?? "").join(",");
      writeStream.write(row + "\n");
    }

    writeStream.end();
    console.log("Conversion successful!");
  } catch (error) {
    console.log("Operation failed");
  }
};
