import { QuestionGenerator } from "@/lib/question-generator";
import { supabaseClient } from "@/lib/supabase/supabaseClient";

interface ValidationResult {
  questionId: string;
  question: string;
  expectedAnswer: string;
  isValid: boolean;
  confidence: number;
  sources: string[];
  validationMethod: 'wikipedia';
  extractedInfo: string;
  discrepancies?: string[];
  timestamp: Date;
}

class QuestionValidator {
  private readonly WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1';

  async validateQuestions(questions: any[]): Promise<ValidationResult[]> {
    console.log(`🔍 Starting validation of ${questions.length} questions...`);
    
    const results: ValidationResult[] = [];
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`\n📋 Validating ${i + 1}/${questions.length}: ${question.question.substring(0, 60)}...`);
      
      try {
        const result = await this.validateSingleQuestion(question);
        results.push(result);
        
        console.log(`${result.isValid ? '✅' : '❌'} Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        
        // Rate limiting
        await this.delay(1000);
        
      } catch (error: any) {
        console.error(`❌ Validation failed:`, error.message);
        results.push(this.createErrorResult(question, error.message));
      }
    }
    
    return results;
  }

  private async validateSingleQuestion(question: any): Promise<ValidationResult> {
    try {
      const searchTerms = this.extractSearchTerms(question);
      const searchResults = await this.searchWikipedia(searchTerms);
      
      if (searchResults.length === 0) {
        return this.createResult(question, false, 0.1, [], 'No Wikipedia results found');
      }

      const article = await this.getWikipediaArticle(searchResults[0].title);
      const validation = this.analyzeContent(question, article.extract || '');
      
      return {
        questionId: question.id || 'unknown',
        question: question.question,
        expectedAnswer: `${question.answer_city}, ${question.answer_country}`,
        isValid: validation.isValid,
        confidence: validation.confidence,
        sources: [`https://en.wikipedia.org/wiki/${encodeURIComponent(searchResults[0].title)}`],
        validationMethod: 'wikipedia',
        extractedInfo: validation.relevantText,
        discrepancies: validation.discrepancies,
        timestamp: new Date()
      };
      
    } catch (error: any) {
      return this.createErrorResult(question, error.message);
    }
  }

  private extractSearchTerms(question: any): string[] {
    const stopWords = ['what', 'where', 'when', 'who', 'which', 'how', 'is', 'was', 'are', 'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
    
    const questionWords = question.question
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word: string) => word.length > 2 && !stopWords.includes(word))
      .slice(0, 4);
    
    return [...questionWords, question.answer_city, question.answer_country]
      .filter((term: string) => term && term.length > 1);
  }

  private async searchWikipedia(searchTerms: string[]): Promise<any[]> {
    const searchQuery = searchTerms.join(' ');
    const url = `${this.WIKIPEDIA_API}/page/search?q=${encodeURIComponent(searchQuery)}&limit=3`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Wikipedia search failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.pages || [];
  }

  private async getWikipediaArticle(title: string): Promise<any> {
    const url = `${this.WIKIPEDIA_API}/page/summary/${encodeURIComponent(title)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to get article: ${response.status}`);
    }
    
    return await response.json();
  }

  private analyzeContent(question: any, text: string): {
    isValid: boolean;
    confidence: number;
    relevantText: string;
    discrepancies: string[];
  } {
    const textLower = text.toLowerCase();
    const city = question.answer_city.toLowerCase();
    const country = question.answer_country.toLowerCase();
    
    const cityFound = textLower.includes(city);
    const countryFound = textLower.includes(country);
    
    const questionTerms = this.extractSearchTerms(question).slice(0, 4);
    const termMatches = questionTerms.filter(term => 
      textLower.includes(term.toLowerCase())
    ).length;
    
    let confidence = 0;
    
    if (cityFound && countryFound) {
      confidence += 0.5;
    } else if (cityFound || countryFound) {
      confidence += 0.3;
    }
    
    const relevanceRatio = termMatches / questionTerms.length;
    if (relevanceRatio >= 0.6) {
      confidence += 0.4;
    } else if (relevanceRatio >= 0.3) {
      confidence += 0.2;
    }

    const discrepancies: string[] = [];
    
    if (!cityFound && !countryFound) {
      discrepancies.push(`No mention of ${city} or ${country}`);
    }
    
    if (relevanceRatio < 0.3) {
      discrepancies.push(`Low relevance: ${termMatches}/${questionTerms.length} terms found`);
    }

    return {
      isValid: confidence >= 0.5,
      confidence: Math.min(confidence, 1),
      relevantText: text.substring(0, 300),
      discrepancies
    };
  }

  private createResult(
    question: any, 
    isValid: boolean, 
    confidence: number, 
    sources: string[], 
    extractedInfo: string
  ): ValidationResult {
    return {
      questionId: question.id || 'unknown',
      question: question.question,
      expectedAnswer: `${question.answer_city}, ${question.answer_country}`,
      isValid,
      confidence,
      sources,
      validationMethod: 'wikipedia',
      extractedInfo,
      timestamp: new Date()
    };
  }

  private createErrorResult(question: any, errorMessage: string): ValidationResult {
    return this.createResult(question, false, 0, [], `Error: ${errorMessage}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport(results: ValidationResult[]) {
    const total = results.length;
    const valid = results.filter(r => r.isValid).length;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / total;
    const flagged = results.filter(r => !r.isValid || r.confidence < 0.6);

    console.log('\n📊 VALIDATION REPORT');
    console.log('==================');
    console.log(`Total Questions: ${total}`);
    console.log(`Valid: ${valid} (${((valid / total) * 100).toFixed(1)}%)`);
    console.log(`Invalid: ${total - valid}`);
    console.log(`Average Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`Flagged for Review: ${flagged.length}`);

    if (flagged.length > 0) {
      console.log('\n🚩 FLAGGED QUESTIONS:');
      flagged.slice(0, 5).forEach((result, i) => {
        console.log(`\n${i + 1}. ${result.question}`);
        console.log(`   Expected: ${result.expectedAnswer}`);
        console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        if (result.discrepancies?.length) {
          console.log(`   Issues: ${result.discrepancies.join(', ')}`);
        }
      });
      if (flagged.length > 5) {
        console.log(`\n   ... and ${flagged.length - 5} more flagged questions`);
      }
    }

    return {
      total,
      valid,
      invalid: total - valid,
      validationRate: `${((valid / total) * 100).toFixed(1)}%`,
      averageConfidence: `${(avgConfidence * 100).toFixed(1)}%`,
      flaggedCount: flagged.length,
      flaggedQuestions: flagged
    };
  }
}

// COMPLETE WORKING SCRIPT - This generates AND validates questions
async function populateAndValidateQuestions() {
  const generator = new QuestionGenerator();
  const validator = new QuestionValidator();
  
  // Your existing question types
  const questionTypes = [
    { category: 'birth_places', description: 'Where famous people were born', count: 2 },
    { category: 'death_places', description: 'Where notable figures died', count: 2 },
    { category: 'invention_origins', description: 'Where things were invented/discovered', count: 2 },
  ];

  console.log(`🌍 Starting generation and validation...`);
  
  const allGeneratedQuestions: any[] = [];

  // 1. GENERATE QUESTIONS (your existing logic)
  for (const questionType of questionTypes) {
    console.log(`\n📍 Generating ${questionType.count} questions for: ${questionType.category}`);
    
    try {      
      const questions = await generator.generateAndStore({
        category: questionType.category,
        count: questionType.count
      });
      
      allGeneratedQuestions.push(...questions);
      console.log(`✅ Generated ${questions.length} questions for ${questionType.category}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to generate questions for ${questionType.category}:`, error);
    }
  }

  console.log(`\n🔍 Starting validation of ${allGeneratedQuestions.length} questions...`);

  // 2. VALIDATE GENERATED QUESTIONS
  if (allGeneratedQuestions.length > 0) {
    const validationResults = await validator.validateQuestions(allGeneratedQuestions);
    const report = validator.generateReport(validationResults);
    
    return {
      generated: allGeneratedQuestions.length,
      validated: validationResults.length,
      report
    };
  } else {
    console.log('❌ No questions were generated to validate');
    return { generated: 0, validated: 0 };
  }
}

// ALTERNATIVE: Validate existing questions from database
async function validateExistingQuestions(limit = 10) {
  const validator = new QuestionValidator();
  
  console.log(`🔍 Fetching ${limit} existing questions from database...`);
  
  const { data: questions, error } = await supabaseClient
    .from('questions')
    .select('*')
    .limit(limit);

  if (error) {
    console.error('❌ Failed to fetch questions:', error);
    return;
  }

  if (!questions || questions.length === 0) {
    console.log('❌ No questions found in database');
    return;
  }

  console.log(`✅ Found ${questions.length} questions, starting validation...`);
  
  const validationResults = await validator.validateQuestions(questions);
  const report = validator.generateReport(validationResults);
  
  return {
    validated: validationResults.length,
    report
  };
}

// Export the functions you can actually run
export { populateAndValidateQuestions, validateExistingQuestions };

// Run it if this file is executed directly
if (require.main === module) {
  populateAndValidateQuestions().catch(console.error);
}