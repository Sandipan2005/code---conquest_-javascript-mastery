
import { GoogleGenerativeAI as GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure API_KEY is available in the environment.
// In local development, this is typically loaded from a `.env` file in the project root
// (e.g., API_KEY="YOUR_ACTUAL_API_KEY_HERE").
// In production/hosted environments, this variable needs to be set in the environment settings.
const KEY_FROM_ENV = process.env.API_KEY;
// Treat API_KEY as null if it's undefined, null, empty, or whitespace-only
const API_KEY = (KEY_FROM_ENV && KEY_FROM_ENV.trim() !== "") ? KEY_FROM_ENV.trim() : null;

let ai: GoogleGenAI | null = null;
let initializationError: string | null = null;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error: any) {
    initializationError = `Failed to initialize GoogleGenAI constructor: ${error.message}`;
    console.error(initializationError);
    ai = null; // Ensure ai is null if constructor fails
  }
} else {
  initializationError = "Gemini API key not found, is empty, or consists only of whitespace in process.env.API_KEY.";
  console.warn(initializationError);
}

const modelName = 'gemini-2.5-flash-preview-04-17';

const checkAiModels = (): boolean => {
  if (!ai) {
    console.warn(`Gemini AI client not available for AI features. Reason: ${initializationError || "API key likely missing or failed initialization."}`);
    return false;
  }
  if (!ai.models) {
    // Enhanced error message
    const apiKeyStatus = API_KEY ? "was processed" : "not found or empty in environment variables";
    console.error(`Gemini AI client error: The 'models' property is undefined after initialization.
This typically indicates an issue with the API key that ${apiKeyStatus}.
Potential causes:
1. Invalid API Key: The key itself might be incorrect or revoked.
2. Permissions: The API key may lack necessary permissions for the Gemini API.
3. Billing: The associated Google Cloud project might have billing issues or billing not enabled.
4. API Not Enabled: The 'Generative Language API' (or similar, e.g., 'Vertex AI API' for some models) may not be enabled in the Google Cloud project.
5. SDK Initialization: A problem with the SDK's full initialization post-constructor.

Please verify your API key and Google Cloud project settings in the Google Cloud Console.
AI features will be disabled.`);
    return false;
  }
  return true;
};


export const generateDynamicHint = async (
  challengeTitle: string,
  challengeDescription: string,
  studentCode: string,
  staticHint?: string
): Promise<string | null> => {
  if (!checkAiModels() || !ai) { // checkAiModels logs the detailed error
    return null;
  }

  const prompt = `
You are an expert JavaScript tutor integrated into a learning game called 'Code & Conquest'.
A student needs a hint for a programming challenge. Your goal is to provide a subtle, guiding hint based on their current code attempt.

Challenge Details:
- Title: "${challengeTitle}"
- Description: "${challengeDescription}"
${staticHint ? `- Static Hint (for your reference, do not repeat): "${staticHint}"` : ''}

Student's Current Code:
\`\`\`javascript
${studentCode}
\`\`\`

Instructions for the Hint:
1.  **Be Subtle:** Do NOT provide the direct solution or write complete lines of code.
2.  **Guide, Don't Solve:** Help the student identify their error or the next logical step.
3.  **Contextual:** Base your hint on the student's specific code and the challenge.
4.  **Concise:** Keep the hint short and to the point.
5.  **Thematic (Optional):** Phrase the hint like a wise sage or oracle, fitting the game's fantasy theme, but clarity is paramount.
6.  **Handle Empty/Minimal Code:** If the code is very short or non-existent, provide a general conceptual hint related to the challenge's core JavaScript concept.
7.  **Address Syntax Errors Gently:** If a syntax error seems likely, you might suggest checking for common mistakes like missing semicolons, brackets, or incorrect keyword usage without being too explicit.
8.  **Address Logic Errors:** If the logic seems flawed, guide them back to the fundamental concept or how to approach the problem differently.

Provide your dynamic hint:`;

  try {
    // At this point, ai and ai.models are assumed to be valid due to checkAiModels()
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
    });
    
    const hintText = response.text;

    if (hintText && hintText.trim().length > 0) {
      return hintText.replace(/```javascript|```/g, "").trim();
    }
    return null;
  } catch (error) {
    console.error("Error calling Gemini API for dynamic hint (ai.models.generateContent):", error);
    if (error instanceof Error) {
         console.error(`Gemini API Error during generateContent for hint: ${error.message}`);
    } else {
        console.error("An unknown error occurred during Gemini API generateContent for hint.");
    }
    return null; 
  }
};

export const generateCodeAnalysis = async (
  challengeTitle: string,
  challengeDescription: string,
  studentCode: string,
  errorMessage: string
): Promise<string | null> => {
  if (!checkAiModels() || !ai) { // checkAiModels logs the detailed error
    return null;
  }

  const prompt = `
You are an expert JavaScript diagnostician and a wise Oracle in the game 'Code & Conquest'.
A student's spell (JavaScript code) has failed for a specific challenge.
Your task is to provide a clear, concise, and pedagogical explanation of *why* their code might be failing or what they should investigate, without giving the direct solution.
Assume the student is a beginner to intermediate learner.

Challenge Information:
- Title: "${challengeTitle}"
- Description: "${challengeDescription}"

Student's Incorrect Code:
\`\`\`javascript
${studentCode}
\`\`\`

Error Message Received by Student (this might be from a custom evaluation function, not always a direct JS error):
"${errorMessage}"

Guidance for Your Analysis:
1.  **Focus on Understanding:** Help the student understand the *concept* behind the error.
2.  **Relate to the Error Message:** If the \`errorMessage\` is informative, explain what it means in the context of their code. If it's generic, try to infer the likely issue.
3.  **Suggest Debugging Steps:** Advise them on what to check (e.g., "Have you declared all necessary variables?", "Is your loop condition correct?", "Are you comparing the right types?").
4.  **Avoid Direct Code Solutions:** Do not rewrite their code for them.
5.  **Be Encouraging and Thematic:** Maintain an encouraging tone, like a wise guide. Phrases like "The Oracle senses..." or "Perhaps the weave of your spell..." are welcome but clarity is key.
6.  **Conciseness:** Keep the analysis to a few key points, ideally 2-3 sentences.
7.  **If the error message is "Execution Error: [some syntax error]. Check your syntax.":** Focus on common syntax pitfalls related to the code.
8.  **If the student code is very minimal or empty:** Guide them towards the first step based on the challenge description.

Provide your insightful analysis:`;

  try {
    // At this point, ai and ai.models are assumed to be valid due to checkAiModels()
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    const analysisText = response.text;
    if (analysisText && analysisText.trim().length > 0) {
      return analysisText.replace(/```javascript|```/g, "").trim();
    }
    return null;
  } catch (error) {
    console.error("Error calling Gemini API for code analysis (ai.models.generateContent):", error);
     if (error instanceof Error) {
         console.error(`Gemini API Error during generateContent for analysis: ${error.message}`);
    } else {
        console.error("An unknown error occurred during Gemini API generateContent for analysis.");
    }
    return null;
  }
};
