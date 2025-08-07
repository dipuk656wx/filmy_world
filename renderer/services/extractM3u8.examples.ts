// Example usage of the M3U8 extractor service

import { 
  extractM3U8Simple, 
  extractM3U8WithUserAgent,
  extractM3U8WithTimeout,
  extractM3U8 
} from './extractM3u8';

// Example 1: Simple extraction (gets first M3U8 found)
export async function example1() {
  try {
    const m3u8Url = await extractM3U8Simple('https://example-streaming-site.com/video');
    console.log('Found M3U8:', m3u8Url);
    return m3u8Url;
  } catch (error) {
    console.error('Failed to extract M3U8:', error);
    throw error;
  }
}

// Example 2: Extract with custom user agent
export async function example2() {
  try {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const m3u8Url = await extractM3U8WithUserAgent('https://example-streaming-site.com/video', userAgent);
    console.log('Found M3U8 with custom user agent:', m3u8Url);
    return m3u8Url;
  } catch (error) {
    console.error('Failed to extract M3U8 with custom user agent:', error);
    throw error;
  }
}

// Example 3: Extract with custom timeout
export async function example3() {
  try {
    const m3u8Url = await extractM3U8WithTimeout('https://example-streaming-site.com/video', 60000); // 60 seconds
    console.log('Found M3U8 with custom timeout:', m3u8Url);
    return m3u8Url;
  } catch (error) {
    console.error('Failed to extract M3U8 with custom timeout:', error);
    throw error;
  }
}

// Example 4: Advanced usage with all options
export async function example4() {
  try {
    const result = await extractM3U8({
      url: 'https://example-streaming-site.com/video',
      timeout: 45000, // 45 seconds
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      waitForLoad: true // Wait for page to fully load
    });

    console.log('Advanced extraction result:', result);
    return result;
  } catch (error) {
    console.error('Advanced extraction failed:', error);
    throw error;
  }
}

// Example 5: Usage in a React component or service
export class VideoStreamExtractor {
  private defaultUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async getVideoStream(url: string): Promise<string> {
    try {
      // Try with default settings first
      let m3u8Url = await extractM3U8Simple(url);
      return m3u8Url;
    } catch (error) {
      console.warn('Default extraction failed, trying with custom user agent...');
      
      try {
        // Fallback with custom user agent
        let m3u8Url = await extractM3U8WithUserAgent(url, this.defaultUserAgent);
        return m3u8Url;
      } catch (fallbackError) {
        console.error('All extraction methods failed:', fallbackError);
        throw new Error('Unable to extract video stream from the provided URL');
      }
    }
  }
}
