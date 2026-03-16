import { goUp, changeDir, listDirectory } from "./navigation.js";
import { parseArgs } from "./utils/argParser.js";
import { countFile } from "./commands/count.js";
import { csvToJson } from "./commands/csvToJson.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";
import { calculateHash } from "./commands/hash.js";
import { hashCompare } from "./commands/hashCompare.js";
import { logStats } from "./commands/logStats.js";
import { encryptFile } from "./commands/encrypt.js";
import { decryptFile } from "./commands/decrypt.js";

export const handleCommand = async (input, state) => {
  const parts = input.trim().split(/\s+/);
  const command = parts[0];
  const parsedArgs = parseArgs(parts.slice(1));

  try {
    switch (command) {
      case "up":
        state.currentDir = goUp(state.currentDir);
        break;
      case "cd":
        if (parts[1])
          state.currentDir = await changeDir(state.currentDir, parts[1]);
        else console.log("Invalid input");
        break;
      case "ls":
        await listDirectory(state.currentDir);
        break;
      case "count":
        if (parsedArgs.input)
          await countFile(state.currentDir, parsedArgs.input);
        else console.log("Invalid input");
        break;
      case "csv-to-json":
        if (parsedArgs.input && parsedArgs.output)
          await csvToJson(parsedArgs.input, parsedArgs.output);
        else console.log("Invalid input");
        break;
      case "json-to-csv":
        if (parsedArgs.input && parsedArgs.output)
          await jsonToCsv(parsedArgs.input, parsedArgs.output);
        else console.log("Invalid input");
        break;
      case "hash":
        if (parsedArgs.input) await calculateHash(state.currentDir, parsedArgs);
        else console.log("Invalid input");
        break;
      case "hash-compare":
        if (parsedArgs.input && parsedArgs.hash)
          await hashCompare(state.currentDir, parsedArgs);
        else console.log("Invalid input");
        break;
      case "encrypt":
        if (parsedArgs.input && parsedArgs.output && parsedArgs.password)
          await encryptFile(state.currentDir, parsedArgs);
        else console.log("Invalid input");
        break;
      case "decrypt":
        if (parsedArgs.input && parsedArgs.output && parsedArgs.password)
          await decryptFile(state.currentDir, parsedArgs);
        else console.log("Invalid input");
        break;
      case "log-stats":
        if (parsedArgs.input && parsedArgs.output)
          await logStats(state.currentDir, parsedArgs.input, parsedArgs.output);
        else console.log("Invalid input");
        break;
      default:
        console.log("Invalid input");
    }
  } catch (error) {
    console.log("Operation failed");
  }
};
