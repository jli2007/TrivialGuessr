import { NextResponse } from "next/server";
import {
  getAllRows,
  getFirstRow,
  getRandomRow,
  incrementReportCount,
} from "@/lib/supabase/supabaseHelper";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    console.log("app/api/[table]/route.ts GET called");

    const { table } = await params;
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const limit = parseInt(url.searchParams.get("limit") ?? "1", 10);
    const orderBy = url.searchParams.get("orderBy");

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

      case "recent": {
        const recentRows = await getFirstRow(table);
        return NextResponse.json({ questions: recentRows }, { status: 200 });
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

// Add PATCH method for updating report count
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