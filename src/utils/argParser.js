export const parseArgs = (args) => {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      // If the next word doesn't start with --, it's the value
      if (value && !value.startsWith("--")) {
        result[key] = value;
        i++; // Skip the value in the next loop
      } else {
        result[key] = true; // It's a flag like --save
      }
    }
  }
  return result;
};
