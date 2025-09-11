import { LLMClient } from "./llm/llmClient";
import { supabaseClient } from "./supabase/supabaseClient";
import { Question, QuestionRequest } from "@/types/question";

export class QuestionGenerator {
  private llmClient: LLMClient;

  constructor() {
    this.llmClient = new LLMClient();
  }

  async generateAndStore(request: QuestionRequest): Promise<Question[]> {
    console.log(
      `Generating ${request.count} questions for ${request.category}`
    );

    // Generate in smaller batches for better quality
    const batchSize = 20;
    const batches = Math.ceil(request.count / batchSize);
    const allQuestions: Question[] = [];

    for (let i = 0; i < batches; i++) {
      const batchCount = Math.min(batchSize, request.count - i * batchSize);

      try {
        const prompt = this.buildEnhancedPrompt({
          ...request,
          count: batchCount,
        });

        const llmResponse = await this.llmClient.generate(prompt);
        const questions = this.parseResponse(llmResponse);

        if (questions.length > 0) {
          const { data, error } = await supabaseClient
            .from("questions")
            .insert(questions)
            .select();

          if (error) throw error;

          allQuestions.push(...(data || []));
          console.log(
            `✓ Batch ${i + 1}/${batches}: Generated ${
              data?.length || 0
            } questions`
          );
        }

        // Rate limiting between batches
        if (i < batches - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`✗ Batch ${i + 1} failed:`, error);
      }
    }

    console.log(`Total: ${allQuestions.length} questions stored`);
    return allQuestions;
  }

  private buildEnhancedPrompt(request: QuestionRequest): string {
    return `Generate exactly ${request.count} fascinating trivia questions for a geographic guessing game.

🌍 THE POSSIBILITIES ARE ENDLESS! Think beyond cities, although cities are valid and promoted, need a good variety:
- Remote locations (Nemo Point, most isolated spot on Earth)
- Natural landmarks (specific trees, rocks, caves, waterfalls)
- Underwater locations (Titanic wreck, deepest ocean trench)
- Arctic/Antarctic research stations
- Desert oases, mountain peaks, volcanic craters
- Battlefields, crash sites, archaeological digs
- Tiny islands, lighthouses, bridges
- Famous intersections, borders, monuments
- Elevation, Murder Rate, birth rate, world-statistics
- Architecture, man-made-wonders, fun-facts (town/city related)

📚 EXAMPLE EXCELLENT QUESTIONS:
- "Where is Point Nemo, the most remote spot on Earth where dead satellites are dumped?"
- "Where stands the 9,000-year-old tree that survived ice ages and is still alive today?"
- "Which forest location was the site of the Christmas Truce soccer game during WWI?"
- "Where did the Enola Gay take off to drop the atomic bomb, from a runway now used for civilian flights?"
- "Which tiny island served as Napoleon's final prison, where he died eating wallpaper with arsenic?"
- "Where is the underwater hotel room where you sleep surrounded by sharks?"
- "Which lighthouse was the last thing Titanic passengers saw before hitting the iceberg?"
- "Where did a single tree deflect a cannonball and save an entire village in 1645?"
- "Which specific forest grove is considered the most haunted place on Earth by paranormal investigators?"
- "Where is the restaurant built inside a 737 airplane that never flew?"

🎯 CATEGORY INSPIRATION FOR ${request.category}:
- Ancient mysteries and lost civilizations
- Bizarre accidents and freak incidents  
- Scientific discoveries made by accident
- Last known locations of extinct species
- Sites of impossible survival stories
- Places where history changed in minutes
- Locations of unsolved mysteries
- Spots where nature defied physics
- Where human error caused major events
- Secret locations revealed decades later

🗺️ GLOBAL DISTRIBUTION (logical population-based split):
- Asia (40%): China, India, Japan, South Korea, Indonesia, Thailand, Philippines, Vietnam, etc.
- Europe (25%): UK, Germany, France, Italy, Spain, Russia, Netherlands, Switzerland, etc.
- North America (15%): USA, Canada, Mexico
- Africa (10%): Nigeria, Egypt, South Africa, Kenya, Morocco, Ethiopia, etc.
- South America (6%): Brazil, Argentina, Peru, Colombia, Chile, etc.
- Oceania (4%): Australia, New Zealand, Pacific Islands

Include questions from ALL continents, with major countries getting more representation but don't forget smaller fascinating places like:
- Bhutan's unique carbon-negative policies
- San Marino's tiny republic quirks
- Liechtenstein's double-landlocked oddities
- Vatican City's papal secrets
- Monaco's gambling history
- Tuvalu's climate change struggles

🎲 DIFFICULTY SCALE (1-10):
1-2: Famous landmarks everyone knows (Eiffel Tower, Great Wall)
3-4: Well-known cities and major historical events (Berlin Wall, Pearl Harbor)
5-6: Moderately known places requiring some education (Machu Picchu, Petra)
7-8: Obscure but interesting locations (specific battle sites, unique natural formations)
9-10: Extremely specific or recently discovered places (research stations, archaeological sites)

TARGET DIFFICULTY: ${request.difficulty}/10

⚡ REQUIREMENTS:
- Any pinpointable location with exact coordinates (lat/lng)
- Rich storytelling with specific details, dates, numbers
- Educational and memorable
- Global representation based on logical population splits
- Include dramatic human stories when possible
- Vary between cities, natural locations, and unique spots
- Ensure coordinates are precise and accurate

OUTPUT ONLY VALID JSON:
[
  {
    "question": "Where in China does the world's largest Buddha statue stand at 208 feet tall, taking 90 years to carve from a cliff face during the Tang Dynasty?",
    "context": "The Leshan Giant Buddha was built to calm the turbulent waters where three rivers meet, and its ears alone are 23 feet long.",
    "answer_city": "Leshan",
    "answer_country": "China",
    "answer_lat": 29.5477,
    "answer_lng": 103.7336,
    "difficulty": 6,
    "category": "${request.category}",
    "time_period": "Tang Dynasty (713-803 AD)",
    "fun_fact": "The statue's drainage system includes hidden gutters in the hair and clothes to prevent erosion from rain."
  }
]

Generate exactly ${request.count} unique, globally diverse questions with difficulty ${request.difficulty}/10:`;
  }

  private parseResponse(
    response: string
  ): Omit<Question, "id" | "created_at">[] {
    try {
      let cleaned = response.trim();
      cleaned = cleaned.replace(/```json\n?|\n?```/g, "");
      cleaned = cleaned.replace(/^[^[]*/, ""); // Remove everything before first [
      cleaned = cleaned.replace(/[^}]*$/, "}]"); // Clean everything after last }

      const questions = JSON.parse(cleaned);

      return questions.filter((q: any) => {
        const isValid =
          q.question &&
          q.answer_city &&
          q.answer_country &&
          typeof q.answer_lat === "number" &&
          typeof q.answer_lng === "number" &&
          q.answer_lat >= -90 &&
          q.answer_lat <= 90 &&
          q.answer_lng >= -180 &&
          q.answer_lng <= 180 &&
          q.question.length > 20;

        if (!isValid) {
          console.warn(
            "Filtered out invalid question:",
            q.question || "No question"
          );
        }

        return isValid;
      });
    } catch (error) {
      console.error("Failed to parse LLM response:", error);
      console.error("Raw response:", response.substring(0, 500) + "...");
      throw new Error("Invalid response format from LLM");
    }
  }

  // Enhanced method for category-agnostic generation
  async generateWildcardQuestions(count: number): Promise<Question[]> {
    return this.generateAndStore({
      category: "wildcard",
      difficulty: 3,
      count,
    });
  }

  async getRandomQuestions(
    count: number,
    category?: string
  ): Promise<Question[]> {
    let query = supabaseClient.from("questions").select("*");

    if (category && category !== "mixed" && category !== "wildcard") {
      query = query.eq("category", category);
    }

    const { data, error } = await query.limit(count * 4); // Get more for better randomization

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    const shuffled = (data || []).sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
