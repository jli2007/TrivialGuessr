import { NextResponse } from "next/server";
import {
  getAllRows,
  getRandomRow,
  incrementReportCount,
  deleteAllRows,
  createDailyChallenge
} from "@/lib/supabase/supabaseHelper";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const limit = parseInt(url.searchParams.get("limit") ?? "1", 10);
    const orderBy = url.searchParams.get("orderBy");

    console.log("app/api/[table]/route.ts GET called", table, action, limit, orderBy);

    if (!table) {
      return NextResponse.json(
        { error: "Table name is required" },
        { status: 400 }
      );
    }

     switch (action) {
      case "all": {
        const activeRows = await getAllRows(table);
        console.log( `Returning ${activeRows.length} rows`);
        return NextResponse.json({ questions: activeRows }, { status: 200 });
      }

      case "leaderboard": {
        const leaderboardRows = await getAllRows(table, limit, orderBy || 'total_score', false);
        return NextResponse.json(leaderboardRows, { status: 200 });
      }

      case "random": {
        if (limit > 1) {
          const results = await Promise.all(
            Array.from({ length: limit }, () => getRandomRow(table))
          );
          return NextResponse.json({ questions: results }, { status: 200 });
        } else {
          const row = await getRandomRow(table);
          return NextResponse.json({ questions: [row] }, { status: 200 });
        }
      }

      case "daily-replace": {
        const replacementRows = await createDailyChallenge("questions", "daily_challenge", limit);
        return NextResponse.json(replacementRows, { status: 200 });
      }

      default: {
        const rows = await getAllRows(table);
        console.log(rows);
        return NextResponse.json({ questions: rows }, { status: 200 });
      }
    }
  } catch (error) {
    console.error("Error fetching rows:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    console.log("app/api/[table]/route.ts PATCH called");

    const { table } = await params;
    const body = await request.json();
    const { questionId, action } = body;

    if (!table) {
      return NextResponse.json(
        { error: "Table name is required" },
        { status: 400 }
      );
    }

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    if (action === "report") {
      // Increment the report count for the question
      const result = await incrementReportCount(table, questionId);
      
      console.log(`Question ${questionId} reported. New report count: ${result.report}`);
      
      return NextResponse.json({ 
        success: true, 
        reportCount: result.report 
      }, { status: 200 });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    console.log("app/api/[table]/route.ts DELETE called");

    const { table } = await params;

    if (!table) {
      return NextResponse.json(
        { error: "Table name is required" },
        { status: 400 }
      );
    }

    const secret = process.env.CRON_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    }

    // Check for manual calls with header
    const headerSecret = request.headers.get("x-clear-secret");
    
    // Check for Vercel cron calls with Authorization header
    const authHeader = request.headers.get("authorization");
    const cronSecret = authHeader?.replace("Bearer ", "");

    // Allow either authentication method
    if (headerSecret !== secret && cronSecret !== secret) {
      console.log("Unauthorized attempt - invalid secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteAllRows(table);

    return NextResponse.json(
      { success: true, message: `All rows deleted from ${table}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting rows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}