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
  tableName: TableName
): Promise<Row[]> {
  console.log(`🔍 Fetching from table: "${tableName}"`);
  
  try {
    const { data, error, status, statusText } = await supabaseClient
      .from<TableName, Row>(tableName)
      .select("*");

    console.log(`📊 Supabase response:`, {
      status,
      statusText,
      hasError: !!error,
      dataLength: data?.length ?? 0,
      error: error?.message || null
    });

    if (error) {
      console.error(`❌ Supabase error for table "${tableName}":`, error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      console.warn(`⚠️ No data returned for table "${tableName}"`);
      return [];
    }

    console.log(`✅ Successfully fetched ${data.length} rows from "${tableName}"`);
    return data;

  } catch (err) {
    console.error(`💥 Exception in getAllRows for table "${tableName}":`, err);
    throw err;
  }
}

export async function getRandomRow<Row, TableName extends string = string>(
  tableName: TableName
): Promise<Row | null> {
  const { data, error } = await supabaseClient
    .from<TableName, Row>(tableName)
    .select("*")
    .order("random()", { ascending: true })
    .limit(1)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
