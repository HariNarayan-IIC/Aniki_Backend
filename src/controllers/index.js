import readline from "readline";
import { askGemini } from "./chatbot.controller.js";

// Setup CLI input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Ask Aniki AI: ", async (userInput) => {
  const reply = await askGemini(userInput);
  console.log("\nAniki AI says:\n" + reply);
  rl.close();
});
