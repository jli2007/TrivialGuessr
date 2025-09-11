import { NextRequest, NextResponse } from 'next/server';
import { QuestionGenerator } from '@/lib/question-generator';

export async function POST(request: NextRequest) {
  try {
    const { category, difficulty = 3, count = 10 } = await request.json();

    const generator = new QuestionGenerator();
    
    // Try to get from database first
    const existingQuestions = await generator.getRandomQuestions(count, category);
    
    if (existingQuestions.length >= count) {
      return NextResponse.json({ 
        questions: existingQuestions.slice(0, count) 
      });
    }

    // Generate new ones if not enough in database
    const newQuestions = await generator.generateAndStore({
      category,
      difficulty,
      count: count * 2 // Generate extra
    });

    return NextResponse.json({ 
      questions: newQuestions.slice(0, count) 
    });
  } catch (error) {
    console.error('Question generation failed:', error);
    return NextResponse.json(
      { message: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const count = parseInt(searchParams.get('count') || '10');

    const generator = new QuestionGenerator();
    const questions = await generator.getRandomQuestions(count, category);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}