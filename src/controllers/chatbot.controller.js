import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
const apiKey = process.env.GEMINI_API_KEY;
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: apiKey });

// Example dummy data (replace with DB data)
const followedRoadmaps = ["Web Development", "Data Science"];

const anikiRules = `
You are Aniki AI — a helpful, friendly, and knowledgeable chatbot built for Project Aniki.
Only respond with academic, career, or motivation-related guidance tailored for students.
Avoid giving medical, political, or unrelated advice.
Encourage interactive learning, collaboration, and self-growth.

The user is currently following these learning roadmaps: ${followedRoadmaps.join(", ")}.
Whenever relevant, personalize responses to help the user in these areas. The response should be concise, clear, and actionable and should not be too long as it will be used in a chatbot. 
Your main audience is Indian students, so also include suggestions like learning resources and tools that are also popular and available in Hindi alongwith other good sources.
`;


export async function askGemini(userInput) {
  const fullPrompt = `${anikiRules}\nUser: ${userInput}`;

  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "No response received.";
  } catch (err) {
    console.error("Gemini error:", err.message);
    return "Something went wrong.";
  }
}