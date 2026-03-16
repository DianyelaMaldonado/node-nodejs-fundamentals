import readline from "node:readline";
import { homedir } from "node:os";
import { handleCommand } from "./repl.js";

const startCLI = () => {
  const state = {
    currentDir: homedir(),
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  console.log("Welcome to Data Processing CLI!");
  console.log(`You are currently in ${state.currentDir}`);

  const showPrompt = () => {
    process.stdout.write(`\nYou are currently in ${state.currentDir}\n> `);
  };

  showPrompt();

  rl.on("line", async (line) => {
    const input = line.trim();

    if (input === ".exit") {
      rl.close();
      return;
    }

    if (input) {
      await handleCommand(input, state);
    }

    showPrompt();
  });

  rl.on("close", () => {
    console.log("Thank you for using Data Processing CLI, goodbye!");
    process.exit(0);
  });

  rl.on("SIGINT", () => {
    rl.close();
  });
};

startCLI();
