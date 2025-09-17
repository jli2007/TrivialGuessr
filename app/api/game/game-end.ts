import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Import your supabase client - adjust path as needed
// import { supabase } from '../../lib/supabaseClient';

// Or initialize here if not importing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface LeaderboardEntry {
  name: string;
  score: number;
  id?: string;
  created_at?: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    const { name, score }: { name: string; score: number } = req.body;

    // Validate required fields
    if (!name || score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and score are required'
      });
    }

    // Validate data types
    if (typeof name !== 'string' || typeof score !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid data types: name must be string, score must be number'
      });
    }

    // Create the leaderboard entry
    const leaderboardEntry: LeaderboardEntry = {
      id: uuidv4(),
      name: name.trim(),
      score: score,
      created_at: new Date().toISOString()
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('daily_leaderboard')
      .insert([leaderboardEntry])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        error: 'Database error: ' + error.message
      });
    }

    // Return success response
    return res.status(201).json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// App Router version (app/api/daily-leaderboard/route.ts)
/*
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { name, score } = await request.json();

    if (!name || score === undefined || score === null) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name and score are required' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || typeof score !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid data types: name must be string, score must be number' },
        { status: 400 }
      );
    }

    const leaderboardEntry = {
      id: uuidv4(),
      name: name.trim(),
      score: score,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('daily_leaderboard')
      .insert([leaderboardEntry])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data[0] },
      { status: 201 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/