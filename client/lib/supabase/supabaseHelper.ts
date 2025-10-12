import { supabaseClient } from "./supabaseClient";

// gets first row of tableName (NOT USED)
export async function getFirstRow(tableName: string) {
  const { data, error } = await supabaseClient
    .from(tableName)
    .select("*")
    .limit(1)
    .single();

  if (error) {
    throw new Error(
      `Error fetching first row from ${tableName}: ${error.message}`
    );
  }

  return data;
}

// gets all rows of tableName
export async function getAllRows<Row, TableName extends string = string>(
  tableName: TableName,
  limit?: number,
  orderBy?: string,
  ascending: boolean = false
): Promise<Row[]> {
  try {
    let query = supabaseClient.from<TableName, Row>(tableName).select("*");

    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    throw err;
  }
}

// gets random row for tableName
export async function getRandomRow<Row, TableName extends string = string>(
  tableName: TableName
): Promise<Row | null> {
  try {
    // Get total count of rows in the table
    const { count, error: countError } = await supabaseClient
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (countError) throw new Error(countError.message);
    if (!count || count === 0) return null;

    // Generate a random offset between 0 and total count
    const randomOffset = Math.floor(Math.random() * count);

    // Get one row at the random offset position
    const { data, error } = await supabaseClient
      .from(tableName)
      .select("*")
      .range(randomOffset, randomOffset)
      .limit(1);

    if (error) throw new Error(error.message);
    return data?.[0] || null;
  } catch (error) {
    console.error(`Error getting random row from ${tableName}:`, error);
    throw error;
  }
}

// increment report count for questionId from tableName
export async function incrementReportCount(
  tableName: string,
  questionId: string | number
) {
  try {
    // First, get the current report count
    const { data: currentData, error: fetchError } = await supabaseClient
      .from(tableName)
      .select("report")
      .eq("id", questionId)
      .single();

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    if (!currentData) {
      throw new Error("Question not found");
    }

    // Increment the report count
    const newReportCount = (currentData.report || 0) + 1;

    // Update with the new count
    const { data, error } = await supabaseClient
      .from(tableName)
      .update({
        report: newReportCount,
      })
      .eq("id", questionId)
      .select("report");

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error("Question not found");
    }

    return data[0];
  } catch (error) {
    console.error(`Error incrementing report count for ${tableName}:`, error);
    throw error;
  }
}

// delete all rows from tableName: CALL SERVER TO USE SERVICE ROLE KEY
export async function deleteAllRows(tableName: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    const res = await fetch(`${baseUrl}/api/delete-table`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tableName }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Request failed with status ${res.status}: ${text}`);
    }

    const json = await res.json();
    if (!json.success) {
      console.error("Error deleting rows:", json.error ?? json);
      return { success: false, error: json.error ?? json };
    }

    console.log(`All rows deleted from ${tableName}`);
    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err instanceof Error ? err.message : err };
  }
}


// gets 5 random rows from fromTable and inserts to toTable
export async function createDailyChallenge(
  fromTable: string,
  toTable: string,
  limit: number
) {
  // Get random rows using the database function (custom)
  const { data: randomRows, error: fetchError } = await supabaseClient.rpc(
    "get_random_questions",
    { row_limit: limit }
  );

  if (fetchError) throw fetchError;

  if (!randomRows || randomRows.length === 0) {
    throw new Error("No rows found to create daily challenge");
  }

  const { error: insertError } = await supabaseClient
    .from(toTable)
    .insert(randomRows);

  if (insertError) throw insertError;

  return { success: true };
}
