"use server";
import dotenv from 'dotenv';

dotenv.config();

interface LLMResponse {
  choices: Array<{
    message: {
      content: string | null;
    };
  }>;
}

export class LLMClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.LLM_API_KEY!;
    this.baseUrl = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
  }

  async generate(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `LLM API error: ${response.status} ${response.statusText}`
      );
    }

    const data: LLMResponse = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      console.error("Invalid LLM response:", data);
      throw new Error("No content in LLM response");
    }

    return data.choices[0].message.content;
  }
}
