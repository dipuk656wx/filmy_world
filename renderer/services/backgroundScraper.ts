export interface PlaylistData {
  image?: string;
  sources: Array<{
    file: string;
    label: string;
    type: string;
    default?: boolean;
  }>;
  trusted?: boolean;
  tracks?: Array<{
    file: string;
    kind: string;
  }>;
  cdn?: number;
}

export interface ExtractedData {
  playlist?: PlaylistData;
  videoId?: string;
  downloadUrl?: string;
  ads?: string[];
  timelinesEnabled?: boolean;
}

export class BackgroundScraper {
  private static instance: BackgroundScraper;

  public static getInstance(): BackgroundScraper {
    if (!BackgroundScraper.instance) {
      BackgroundScraper.instance = new BackgroundScraper();
    }
    return BackgroundScraper.instance;
  }

  // Simple method to fetch HTML content from a URL
  public async directFetch(url: string): Promise<string> {
    try {
      console.log(`Fetching HTML from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        }
      });

      console.log(`Response Status: ${response.status}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      console.log(`HTML fetched successfully. Length: ${html.length} characters`);
      
      return html;
    } catch (error) {
      console.error('Direct fetch failed:', error);
      throw error;
    }
  }

  // Alternative method using proxy if direct fetch fails
  public async proxyFetch(url: string): Promise<string> {
    try {
      console.log(`Fetching HTML via proxy from: ${url}`);
      
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Proxy fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Proxy fetch successful. HTML Length: ${data.contents.length} characters`);
      
      return data.contents;
    } catch (error) {
      console.error('Proxy fetch failed:', error);
      throw error;
    }
  }

  // Method that tries direct fetch first, then proxy as fallback
  public async fetchHTML(url: string): Promise<string> {
    try {
      // Try direct fetch first
      return await this.directFetch(url);
    } catch (error) {
      console.log('Direct fetch failed, trying proxy...');
      
      try {
        return await this.proxyFetch(url);
      } catch (proxyError) {
        console.error('Both direct and proxy fetch failed');
        throw new Error(`Failed to fetch HTML: ${error}`);
      }
    }
  }

  // Extract playlist and other data from HTML content
  public extractPlaylistFromHTML(html: string): ExtractedData {
    const extractedData: ExtractedData = {};

    try {
      // Extract playlist data
      const playlistMatch = html.match(/window\.playlist\s*=\s*({[\s\S]*?});/);
      if (playlistMatch) {
        try {
          const playlistString = playlistMatch[1];
          const playlist = JSON.parse(playlistString) as PlaylistData;
          extractedData.playlist = playlist;
          console.log('✓ Playlist extracted successfully');
          console.log('  Sources found:', playlist.sources?.length || 0);
          console.log('  Image:', playlist.image ? 'Yes' : 'No');
        } catch (e) {
          console.error('Failed to parse playlist JSON:', e);
        }
      } else {
        console.log('No playlist found in HTML');
      }

      // Extract video ID
      const videoIdMatch = html.match(/window\.v_id\s*=\s*["']([^"']+)["']/);
      if (videoIdMatch) {
        extractedData.videoId = videoIdMatch[1];
        console.log('✓ Video ID extracted:', extractedData.videoId);
      }

      // Extract download URL
      const downloadUrlMatch = html.match(/window\.downloadUrl\s*=\s*["']([^"']+)["']/);
      if (downloadUrlMatch) {
        extractedData.downloadUrl = downloadUrlMatch[1];
        console.log('✓ Download URL extracted:', extractedData.downloadUrl);
      }

      // Extract ads array
      const adsMatch = html.match(/window\.ads\s*=\s*(\[[\s\S]*?\]);/);
      if (adsMatch) {
        try {
          const adsString = adsMatch[1];
          const ads = JSON.parse(adsString) as string[];
          extractedData.ads = ads;
          console.log('✓ Ads extracted:', ads.length, 'entries');
        } catch (e) {
          console.error('Failed to parse ads JSON:', e);
        }
      }

      // Extract timelines enabled
      const timelinesMatch = html.match(/window\.timelinesEnabled\s*=\s*(\d+)/);
      if (timelinesMatch) {
        extractedData.timelinesEnabled = parseInt(timelinesMatch[1]) === 1;
        console.log('✓ Timelines enabled:', extractedData.timelinesEnabled);
      }

    } catch (error) {
      console.error('Error extracting data from HTML:', error);
    }

    return extractedData;
  }

  // Combined method to fetch HTML and extract playlist
  public async fetchAndExtractPlaylist(url: string): Promise<ExtractedData> {
    try {
      console.log('🔍 Fetching and extracting playlist from:', url);
      
      // Fetch HTML
      const html = await this.fetchHTML(url);
      console.log(`HTML fetched successfully. Length: ${html.length} characters`);
      
      // Extract playlist data
      const extractedData = this.extractPlaylistFromHTML(html);
      
      console.log('📊 Extraction Summary:');
      console.log('  - Playlist:', extractedData.playlist ? '✓' : '✗');
      console.log('  - Video ID:', extractedData.videoId ? '✓' : '✗');
      console.log('  - Download URL:', extractedData.downloadUrl ? '✓' : '✗');
      console.log('  - Ads:', extractedData.ads ? `✓ (${extractedData.ads.length})` : '✗');
      console.log('  - Timelines:', extractedData.timelinesEnabled !== undefined ? '✓' : '✗');
      
      return extractedData;
    } catch (error) {
      console.error('Failed to fetch and extract playlist:', error);
      throw error;
    }
  }

  // Get best quality video source from playlist
  public getBestQualitySource(playlist: PlaylistData): string | null {
    if (!playlist.sources || playlist.sources.length === 0) {
      return null;
    }

    // Find default source first
    const defaultSource = playlist.sources.find(source => source.default);
    if (defaultSource) {
      console.log('Using default source:', defaultSource.label);
      return defaultSource.file;
    }

    // Sort by quality (higher number = better quality)
    const sortedSources = playlist.sources.sort((a, b) => {
      const qualityA = parseInt(a.label) || 0;
      const qualityB = parseInt(b.label) || 0;
      return qualityB - qualityA;
    });

    console.log('Using highest quality source:', sortedSources[0].label);
    return sortedSources[0].file;
  }

  // Get all available quality options
  public getQualityOptions(playlist: PlaylistData): Array<{label: string, url: string}> {
    if (!playlist.sources) {
      return [];
    }

    return playlist.sources.map(source => ({
      label: source.label,
      url: source.file
    }));
  }
}

export default BackgroundScraper;