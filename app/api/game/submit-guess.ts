import { NextApiRequest, NextApiResponse } from "next";
import { supabaseClient } from "@/lib/supabase/supabaseClient";
import { haversineDistance, calculateScore } from "@/utils/gameUtils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { questionId, guessLat, guessLng } = req.body;
  
  // Get the correct answer
  const { data: question } = await supabaseClient
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single();
    
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  // Calculate score
  const distance = haversineDistance(
    guessLat, 
    guessLng, 
    question.answer_lat, 
    question.answer_lng
  )
  const result = calculateScore(distance);
  
//   // Update daily leaderboard
//   if (playerName) {
//     await supabaseClient
//       .from('daily_leaderboard')
//       .upsert({
//         player_name: playerName,
//         total_score: result.score, // This would need to be incremental
//       }, {
//         onConflict: 'player_name'
//       });
//   }
  
  res.json({
    score: result,
    distance: distance,
    correct_location: {
      lat: question.answer_lat,
      lng: question.answer_lng,
      city: question.answer_city,
      country: question.answer_country
    },
    fun_fact: question.fun_fact
  });
}