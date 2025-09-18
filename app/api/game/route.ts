import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { NextResponse, NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { player_name, total_score } = await request.json();

    if (!player_name || total_score === undefined || total_score === null) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: player_name and total_score are required' },
        { status: 400 }
      );
    }

    if (typeof player_name !== 'string' || typeof total_score !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid data types: player_name must be string, total_score must be number' },
        { status: 400 }
      );
    }

    const leaderboardEntry = {
      id: uuidv4(),
      player_name: player_name.trim(),
      total_score: total_score,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
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
