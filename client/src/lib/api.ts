import { apiRequest } from "./queryClient";

export interface ScrapeResponse {
  content: string;
  error?: string;
  message?: string;
}

export async function scrapeUrl(url: string): Promise<string> {
  const response = await apiRequest(
    "GET", 
    `/api/scrape?url=${encodeURIComponent(url)}`
  );
  
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    // Error response
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || 'Unknown error occurred');
  }
  
  // Success response (plain text)
  return await response.text();
}
