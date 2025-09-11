import { QuestionGenerator } from "@/lib/question-generator";

async function populateQuestions() {
  const generator = new QuestionGenerator();
  
  // Way more specific and interesting categories
  const questionTypes = [
    // Historical & People
    { category: 'birth_places', description: 'Where famous people were born', count: 1 },
    { category: 'death_places', description: 'Where notable figures died', count: 1 },
    { category: 'first_performances', description: 'Where artists first performed/exhibited', count: 1},
    { category: 'education_origins', description: 'Where famous people studied', count: 1},
    
    // Inventions & Discoveries
    { category: 'invention_origins', description: 'Where things were invented/discovered', count: 1 },
    { category: 'first_factories', description: 'Where first manufacturing happened', count: 1},
    { category: 'patent_locations', description: 'Where patents were filed', count: 1},
    
    // Sports & Entertainment
    { category: 'sports_origins', description: 'Where sports/games originated', count: 1 },
    { category: 'first_stadiums', description: 'Historic sports venues', count: 0},
    { category: 'music_venues', description: 'Legendary concert halls/venues', count: 0},
    { category: 'film_locations', description: 'Where movies were filmed', count: 0},
    
    // Food & Culture
    { category: 'food_origins', description: 'Where dishes/ingredients originated', count: 0 },
    { category: 'restaurant_firsts', description: 'First restaurants/chains locations', count: 0},
    { category: 'cultural_festivals', description: 'Where festivals originated', count: 0},
    
    // Business & Economics
    { category: 'company_origins', description: 'Where companies were founded', count: 0 },
    { category: 'stock_exchanges', description: 'Financial centers and markets', count: 0},
    { category: 'world_statistics', description: 'Cities with highest/lowest stats', count: 0 },
    
    // Geography & Nature
    { category: 'natural_extremes', description: 'Highest/lowest/deepest places', count: 0 },
    { category: 'unique_ecosystems', description: 'Special natural locations', count: 0},
    { category: 'climate_records', description: 'Weather/temperature extremes', count: 0},
    
    // Disasters & Events
    { category: 'natural_disasters', description: 'Earthquake/tsunami/volcano locations', count: 0 },
    { category: 'man_made_disasters', description: 'Accidents/explosions/spills', count: 0},
    { category: 'historical_battles', description: 'War locations and battlefields', count: 0},
    { category: 'peace_treaties', description: 'Where treaties were signed', count: 0},
    
    // Architecture & Landmarks
    { category: 'architectural_firsts', description: 'First skyscrapers/bridges/tunnels', count: 0},
    { category: 'religious_sites', description: 'Important temples/churches/mosques', count: 0 },
    { category: 'ancient_wonders', description: 'Archaeological sites', count: 0},
    
    // Transportation & Infrastructure
    { category: 'transport_firsts', description: 'First railways/airports/ports', count: 0},
    { category: 'engineering_marvels', description: 'Canals/dams/bridges', count: 0},
    
    // Science & Technology
    { category: 'research_facilities', description: 'Labs/observatories/universities', count: 0},
    { category: 'space_related', description: 'Launch sites/tracking stations', count: 0},
    { category: 'medical_breakthroughs', description: 'Where treatments were discovered', count: 0},
    
    // Quirky & Unusual
    { category: 'world_records', description: 'Locations of unusual world records', count: 0 },
    { category: 'urban_legends', description: 'Places with famous legends/mysteries', count: 0},
    { category: 'filming_locations', description: 'Iconic movie/TV show locations', count: 0},
    { category: 'abandoned_places', description: 'Famous ghost towns/ruins', count: 0},
    
    // Modern & Contemporary
    { category: 'internet_firsts', description: 'Where internet milestones happened', count: 0},
    { category: 'viral_moments', description: 'Where famous photos/videos happened', count: 0},
    { category: 'protest_locations', description: 'Historic demonstration sites', count: 0}
  ];

  console.log(`🌍 Starting comprehensive question generation across ${questionTypes.length} categories...`);
  
  let totalGenerated = 0;
  const totalExpected = questionTypes.reduce((sum, type) => sum + type.count, 0);

  for (const questionType of questionTypes) {
    console.log(`\n📍 Generating ${questionType.count} questions for: ${questionType.category}`);
    console.log(`   Description: ${questionType.description}`);
    
    try {      
      const questions = await generator.generateAndStore({
        category: questionType.category,
        count: questionType.count
      });
      
      totalGenerated += questions.length;
      console.log(`✅ Generated ${questions.length}/${questionType.count} questions for ${questionType.category}`);
      console.log(`   Progress: ${totalGenerated}/${totalExpected} total questions`);
      
      // Dynamic wait time based on complexity
      const waitTime = questionType.count > 100 ? 4000 : 2500;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
    } catch (error) {
      console.error(`❌ Failed to generate questions for ${questionType.category}:`, error);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n🎉 Question population completed!`);
  console.log(`📊 Total generated: ${totalGenerated}/${totalExpected} questions`);
  
  // Generate some completely random wildcard questions
  console.log('\n🎲 Generating wildcard questions (completely random topics)...');
  try {
    const wildcardQuestions = await generator.generateAndStore({
      category: 'wildcard_random',
      difficulty: 6,
      count: 200
    });
    console.log(`✅ Generated ${wildcardQuestions.length} wildcard questions!`);
    totalGenerated += wildcardQuestions.length;
  } catch (error) {
    console.error('❌ Wildcard generation failed:', error);
  }
  
  console.log(`\n🏆 FINAL TOTAL: ${totalGenerated} questions generated!`);
}

populateQuestions().catch(console.error);