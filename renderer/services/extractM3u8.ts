const { ipcRenderer } = window.require('electron');

export interface ExtractM3U8Options {
  url: string;
  timeout?: number;
  userAgent?: string;
  waitForLoad?: boolean;
}

/**
 * Extracts the first M3U8 link from a given URL using a hidden Electron window
 * @param options - Configuration options for the extraction
 * @returns Promise that resolves to the first M3U8 URL found or rejects with an error
 */
export async function extractM3U8(options: ExtractM3U8Options): Promise<string> {
  const { 
    url, 
    timeout = 30000, 
    userAgent,
    waitForLoad = true
  } = options;

  if (!url) {
    throw new Error('URL is required');
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('URL must start with http:// or https://');
  }

  try {
    const result = await ipcRenderer.invoke('extract-m3u8', {
      url,
      timeout,
      userAgent,
      waitForLoad
    });

    return result;
  } catch (error) {
    console.error('Failed to extract M3U8:', error);
    throw error;
  }
}

/**
 * Extracts the first M3U8 link from a given URL with default options
 * @param url - The URL to extract M3U8 from
 * @returns Promise that resolves to the first M3U8 URL found
 */
export async function extractM3U8Simple(url: string): Promise<string> {
  return extractM3U8({ url });
}

/**
 * Extracts M3U8 links with custom user agent (useful for bypassing some restrictions)
 * @param url - The URL to extract M3U8 from
 * @param userAgent - Custom user agent string
 * @returns Promise that resolves to the first M3U8 URL found
 */
export async function extractM3U8WithUserAgent(url: string, userAgent: string): Promise<string> {
  return extractM3U8({ url, userAgent });
}

/**
 * Extracts M3U8 links with a custom timeout
 * @param url - The URL to extract M3U8 from
 * @param timeout - Timeout in milliseconds
 * @returns Promise that resolves to the first M3U8 URL found
 */
export async function extractM3U8WithTimeout(url: string, timeout: number): Promise<string> {
  return extractM3U8({ url, timeout });
}

export default extractM3U8;
