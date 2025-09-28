// import { useState, useCallback } from 'react';
// import { GameSession } from '@/types/session';
// import { GameAnswer } from '@/types';

// export const useGameSession = (gameMode: string, userId: string) => {
//   const [session, setSession] = useState<GameSession | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Initialize or resume game session
//   const initializeSession = useCallback(async () => {
//     try {
//       setLoading(true);
      
//       // For daily games, check if user already played today
//       if (gameMode === 'daily') {
//         const existingSession = await fetch(`/api/game/daily-session/${userId}`);
//         const data = await existingSession.json();
        
//         if (data.session) {
//           setSession(data.session);
//           setLoading(false);
//           return data.session;
//         }
//       }
      
//       // Create new session
//       const response = await fetch('/api/game/session', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ gameMode, userId })
//       });
      
//       const newSession = await response.json();
//       setSession(newSession);
//       setLoading(false);
//       return newSession;
      
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to initialize session');
//       setLoading(false);
//     }
//   }, [gameMode, userId]);

//   // Save progress after each question
//   const updateSession = useCallback(async (updates: Partial<GameSession>) => {
//     if (!session) return;

//     try {
//       const response = await fetch(`/api/game/session/${session.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updates)
//       });

//       const updatedSession = await response.json();
//       setSession(updatedSession);
//       return updatedSession;
//     } catch (err) {
//       console.error('Failed to update session:', err);
//       // Optionally queue for retry
//     }
//   }, [session]);

//   // Complete game
//   const completeSession = useCallback(async (finalScore: number, allAnswers: GameAnswer[]) => {
//     if (!session) return;

//     try {
//       const response = await fetch(`/api/game/session/${session.id}/complete`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           score: finalScore, 
//           answers: allAnswers,
//           completedAt: new Date().toISOString()
//         })
//       });

//       const completedSession = await response.json();
//       setSession(completedSession);
//       return completedSession;
//     } catch (err) {
//       console.error('Failed to complete session:', err);
//     }
//   }, [session]);

//   return {
//     session,
//     loading,
//     error,
//     initializeSession,
//     updateSession,
//     completeSession
//   };
// };