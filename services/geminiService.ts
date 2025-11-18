
import { GoogleGenAI, Type } from "@google/genai";
import { Player, Stock } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNewsEvent = async (stocks: Stock[], players: Player[]): Promise<{title: string, content: string} | null> => {
  const stockNames = stocks.map(s => s.name).join(', ');
  const playerNames = players.map(p => p.name).join(', ');

  const prompt = `
    Create a short, humorous, and dramatic news headline and a single-sentence news brief for a drinking game called "Bussruta: Nations".
    The news should impact the game's economy or players.
    Mention one of these stocks: ${stockNames}.
    You can also mention one of these nations (players): ${playerNames}.
    Keep the tone funny and slightly absurd.
    
    Examples:
    - "Tuborg CEO funnet i en fontene - aksjen stuper!"
    - "Skatt på røde kort innført av nasjonen ${players.length > 0 ? players[0].name : 'Kløverland'}."
    - "DNB lanserer 'BussCoin' kredittkort, aksjen skyter i været."
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The catchy, short news headline.",
            },
            content: {
              type: Type.STRING,
              description: "A single sentence describing the event.",
            },
          },
          required: ["title", "content"],
        },
      },
    });

    // Fix: Clean the response text before parsing, removing markdown fences if they exist.
    let jsonString = response.text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7);
      if (jsonString.endsWith('```')) {
        jsonString = jsonString.substring(0, jsonString.length - 3);
      }
    }
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("Error generating news event:", error);
    // Fallback in case of API error
    return {
        title: "Tekniske problemer på nyhetssenteret!",
        content: "En kaffekopp ble sølt på serveren. Alt er som før."
    };
  }
};
