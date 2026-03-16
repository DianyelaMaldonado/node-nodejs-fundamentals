import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";

const createCsvTransform = () => {
  let headers = null;
  let isFirstLine = true;

  return new Transform({
    transform(chunk, encoding, callback) {
      const content = chunk.toString();
      const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");

      if (isFirstLine && lines.length > 0) {
        // Get headers from the first line
        headers = lines
          .shift()
          .split(",")
          .map((h) => h.trim());
        isFirstLine = false;
        this.push("[\n");
      }

      const jsonRows = lines.map((line, index) => {
        const values = line.split(",");
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = values[i]?.trim() || "";
        });

        // Add comma except for the very first object in the array
        const prefix = index === 0 && this._isNewArray ? "" : ",\n";
        this._isNewArray = false;
        return JSON.stringify(obj, null, 2);
      });

      // Join the rows with commas
      if (jsonRows.length > 0) {
        // Logic to handle commas between chunks
        const output = (this.notFirstPush ? ",\n" : "") + jsonRows.join(",\n");
        this.push(output);
        this.notFirstPush = true;
      }
      callback();
    },
    flush(callback) {
      this.push("\n]");
      callback();
    },
  });
};

export const csvToJson = async (inputPath, outputPath) => {
  try {
    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath);
    const transformStream = createCsvTransform();
    transformStream.notFirstPush = false;
    transformStream._isNewArray = true;

    await pipeline(readStream, transformStream, writeStream);
    console.log("Conversion successful!");
  } catch (error) {
    console.log("Operation failed");
  }
};
