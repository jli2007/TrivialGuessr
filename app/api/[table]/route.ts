import { NextResponse } from "next/server";
import {
  getAllRows,
  getFirstRow,
  getRandomRow,
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
