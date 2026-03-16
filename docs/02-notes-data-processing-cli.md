# 🛠️ Data Processing CLI - Technical Implementation Notes

## 🎮 1. REPL & State Management
* **Persistent State**: The application maintains a `state` object (e.g., `{ currentDir: homedir() }`) that persists throughout the session. This allows commands like `cd` to update the global context of the app.
* **Readline Interface**: Used to create a continuous loop. It "listens" for user input, processes it through a dispatcher, and then prompts the user again.
* **Graceful Exit**: Implementing `.exit` and handling `SIGINT` (Ctrl+C) to ensure the terminal returns to its normal state properly.

---

## ⚙️ 2. Professional Argument Parsing
* **Flag Extraction**: We built a custom parser to transform a raw string array `["--input", "data.csv"]` into a clean object `{ input: "data.csv" }`. 
* **Boolean Flags**: The parser identifies flags without values (like `--save`) and assigns them a `true` value automatically.

---

## 🛤️ 3. Relative & Absolute Path Resolution
* **Context-Aware Paths**: Every command uses a `resolvePath` utility. It combines the `currentDir` from the app state with the user's input string.
* **`path.resolve`**: Crucial for handling both relative paths (`./file.txt`) and absolute paths (`/Users/dian/file.txt`) seamlessly.

---

## 🔒 4. Authenticated Encryption (AES-256-GCM)
* **GCM Mode**: Unlike basic encryption, GCM provides "authenticated encryption," ensuring the data wasn't tampered with.
* **The "Secret Sandwich"**: We learned to structure the output file as: `Salt (16b)` + `IV (12b)` + `Encrypted Data` + `AuthTag (16b)`.
* **Scrypt**: Used for Key Derivation. It turns a simple password into a cryptographically strong 32-byte key using a random Salt.

---

## 🏎️ 5. Parallel Processing with Workers
* **CPU Core Scaling**: Using `os.cpus().length` to determine how many Worker Threads to spawn, maximizing hardware performance.
* **Line-Boundary Splitting**: When processing large files, we split them into chunks but ensure we don't cut a log line in half (Divide and Conquer).
* **Stats Aggregation**: Each worker calculates "partial stats" and sends them back via `parentPort`. The main thread then "reduces" or merges these into the final result.

---

## 🌊 6. Advanced Stream Pipelines
* **`pipeline()` from `node:stream/promises`**: The most robust way to connect a `ReadStream`, a `Transform` (like CSV-to-JSON), and a `WriteStream`. It automatically manages memory (backpressure) and closes all streams if an error occurs.
* **Memory Efficiency**: By using Streams, the application can process 10GB files using only a few megabytes of RAM.