// export async function POST(request: Request) {
//   const { gameMode, userId } = await request.json();
  
//   // Generate session ID
//   const sessionId = crypto.randomUUID();
  
//   // Get questions based on game mode
//   const questions = gameMode === 'daily' 
//     ? await getDailyQuestions()
//     : await getRandomQuestions();
  
//   const session: GameSession = {
//     id: sessionId,
//     userId,
//     gameMode,
//     currentQuestion: 0,
//     score: 0,
//     answers: [],
//     isComplete: false,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   };
  
//   // Save to database
//   await db.gameSessions.create(session);
  
//   return Response.json({ ...session, questions });
// }

// // api/game/session/[id]/route.ts - Update existing session
// export async function PATCH(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const sessionId = params.id;
//   const updates = await request.json();
  
//   // Update session in database
//   const updatedSession = await db.gameSessions.update(sessionId, {
//     ...updates,
//     updatedAt: new Date().toISOString()
//   });
  
//   return Response.json(updatedSession);
// }

// // api/game/session/[id]/complete/route.ts - Complete game session
// export async function POST(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const sessionId = params.id;
//   const { score, answers, completedAt } = await request.json();
  
//   // Validate answers server-side for security
//   const validatedScore = await validateAndCalculateScore(answers);
  
//   const completedSession = await db.gameSessions.update(sessionId, {
//     score: validatedScore, // Use server-calculated score
//     answers,
//     isComplete: true,
//     completedAt,
//     updatedAt: new Date().toISOString()
//   });
  
//   // Update leaderboards, achievements, etc.
//   if (completedSession.gameMode === 'daily') {
//     await updateDailyLeaderboard(completedSession.userId, validatedScore);
//   }
  
//   return Response.json(completedSession);
// }

// // api/game/daily-session/[userId]/route.ts - Check daily game status
// export async function GET(
//   request: Request,
//   { params }: { params: { userId: string } }
// ) {
//   const userId = params.userId;
//   const today = new Date().toISOString().split('T')[0];
  
//   // Check if user already played today
//   const existingSession = await db.gameSessions.findFirst({
//     where: {
//       userId,
//       gameMode: 'daily',
//       createdAt: {
//         gte: `${today}T00:00:00.000Z`,
//         lt: `${today}T23:59:59.999Z`
//       }
//     }
//   });
  
//   return Response.json({ session: existingSession });
// }