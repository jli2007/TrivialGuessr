import { supabaseClient } from "./supabaseClient";

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

export async function getRandomRow<Row, TableName extends string = string>(
  tableName: TableName
): Promise<Row | null> {
  try {
    // Get total count of rows in the table
    const { count, error: countError } = await supabaseClient
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) throw new Error(countError.message);
    if (!count || count === 0) return null;

    // Generate a random offset between 0 and total count
    const randomOffset = Math.floor(Math.random() * count);

    // Get one row at the random offset position
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('*')
      .range(randomOffset, randomOffset)
      .limit(1);

    if (error) throw new Error(error.message);
    return data?.[0] || null;

  } catch (error) {
    console.error(`Error getting random row from ${tableName}:`, error);
    throw error;
  }
}