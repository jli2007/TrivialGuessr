import { QuestionGenerator } from "@/lib/question-generator";

async function populateQuestions() {
  const generator = new QuestionGenerator();
  
  const categories = [
    'historical_figures',
    'inventions', 
    'disasters',
    'geography',
    'landmarks',
    'food_culture',
    'wildcard' // For unlimited creative questions
  ];

  console.log('🌍 Starting unlimited question generation...');

  for (const category of categories) {
    console.log(`\n📍 Generating questions for: ${category}`);
    
    try {
      const questionCount = category === 'wildcard' ? 200 : 100; // More wildcards
      
      const questions = await generator.generateAndStore({
        category,
        difficulty: Math.floor(Math.random() * 3) + 2, // Random difficulty 2-4
        count: questionCount
      });
      
      console.log(`✅ Generated ${questions.length} questions for ${category}`);
      
      // Longer wait for wildcard (more creative generation)
      const waitTime = category === 'wildcard' ? 3000 : 2000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
    } catch (error) {
      console.error(`❌ Failed to generate questions for ${category}:`, error);
      
      // Continue with other categories even if one fails
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('\n🎉 Question population completed!');
  
  // Generate some bonus ultra-creative questions
  console.log('\n🚀 Generating bonus creative questions...');
  try {
    await generator.generateWildcardQuestions(50);
    console.log('✅ Bonus questions generated!');
  } catch (error) {
    console.error('❌ Bonus generation failed:', error);
  }
}

populateQuestions().catch(console.error);