"use server";

import { revalidatePath } from "next/cache";

/**
 * Simulates a server action mutating data via gRPC / DB call.
 */
export async function deleteItemAction(id: string, domain: string) {
  // Simulate network delay for the mutation
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log(`[SERVER ACTION] Deleted item ${id} from domain ${domain}`);

  // Crucial Architecture Rule: Explicitly revalidate the exact path
  // so the layout doesn't hard-reload but the nested segment fetches fresh data.
  revalidatePath(`/dashboard/${domain}`, "page");
  
  return { success: true };
}
