import { supabaseClient } from "./supabaseClient";

export async function getFirstRow(tableName: string) {
  const { data, error } = await supabaseClient
    .from(tableName)
    .select('*')
    .limit(1)
    .single(); 

  if (error) {
    throw new Error(`Error fetching first row from ${tableName}: ${error.message}`);
  }

  return data;
}

export async function getAllRows<T>(tableName: string): Promise<T[]> {
  const { data, error } = await supabaseClient
    .from(tableName)
    .select('*');

  if (error) throw new Error(error.message);

  return data || [];
}