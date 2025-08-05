import * as url from 'url';
import { updateVidsrcLinkBackground } from './tmdbApi';

export const sanitizeMovieName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9\-_]/g, '').trim();
  };

// Utility function to parse video data from HTML
export const parseVideoItems = async (url: string) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const items = doc.querySelectorAll('.item');
    
    const videoData = Array.from(items).map(item => {
      const link = item.querySelector('a.item_link');
      const img = item.querySelector('img[data-src], img[src]');
      const title = item.querySelector('.title');
      const viewsElement = item.querySelector('.m_views');
      const timeElement = item.querySelector('.m_time');
      const hdMark = item.querySelector('.hd_mark');
      const trailerUrl = item.querySelector('[data-trailer_url]');
      
      // Extract video ID from URL
      const href = link?.getAttribute('href') || '';
      const videoId = href.replace('/watch/', '');
      
      // Extract thumbnail URL
      const thumbnail = img?.getAttribute('data-src') || img?.getAttribute('src') || '';
      
      // Extract views count and convert to number
      const viewsText = viewsElement?.textContent?.trim().replace(/[^\d.KM]/g, '') || '0';
      let views = 0;
      if (viewsText.includes('K')) {
        views = parseFloat(viewsText.replace('K', '')) * 1000;
      } else if (viewsText.includes('M')) {
        views = parseFloat(viewsText.replace('M', '')) * 1000000;
      } else {
        views = parseFloat(viewsText) || 0;
      }
      
      // Extract duration and convert to seconds
      const timeText = timeElement?.textContent?.trim() || '';
      const timeParts = timeText.split(':').map(part => parseInt(part.replace(/\D/g, '')) || 0);
      let duration = 0;
      if (timeParts.length === 3) {
        duration = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      } else if (timeParts.length === 2) {
        duration = timeParts[0] * 60 + timeParts[1];
      }
      
      return {
        id: videoId,
        title: title?.textContent?.trim() || '',
        thumbnail: thumbnail,
        url: href,
        views: Math.round(views),
        duration: duration,
        durationText: timeText,
        quality: hdMark?.textContent?.trim() || '',
        isHD: !!hdMark,
        trailerUrl: trailerUrl?.getAttribute('data-trailer_url') || '',
        viewsText: viewsElement?.textContent?.trim() || '0'
      };
    });
    
    return videoData;
  } catch (error) {
    console.error('Error fetching and parsing video data:', error);
    return [];
  }
};

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

export interface ExtractedInfo {
  title?: string;
  isHD?: boolean;
  likes?: string;
  dislikes?: string;
  views?: string;
  description?: string;
}

export interface ExtractedData {
  playlist?: PlaylistData;
  videoId?: string;
  downloadUrl?: string;
  ads?: string[];
  timelinesEnabled?: boolean;
  info?: ExtractedInfo;
}

export async function extractDataFromUrl(url: string): Promise<ExtractedData> {
  const extractedData: ExtractedData = {};
  try {
    console.log('🔍 Fetching HTML from:', url);
    const res = await fetch(url);
    const html = await res.text();
    console.log(`✓ HTML fetched (${html.length} chars)`);

    // Extract playlist
    const playlistMatch = html.match(/window\.playlist\s*=\s*({[\s\S]*?});/);
    if (playlistMatch) {
      try {
        const playlist = JSON.parse(playlistMatch[1]) as PlaylistData;
        extractedData.playlist = playlist;
        console.log('✓ Playlist parsed:', playlist.sources?.length || 0, 'sources');
      } catch (e) {
        console.error('✗ Playlist JSON parse failed:', e);
      }
    }

    // Extract video ID
    const videoIdMatch = html.match(/window\.v_id\s*=\s*["']([^"']+)["']/);
    if (videoIdMatch) {
      extractedData.videoId = videoIdMatch[1];
      console.log('✓ Video ID:', extractedData.videoId);
    }

    // Extract download URL
    const downloadUrlMatch = html.match(/window\.downloadUrl\s*=\s*["']([^"']+)["']/);
    if (downloadUrlMatch) {
      extractedData.downloadUrl = downloadUrlMatch[1];
      console.log('✓ Download URL:', extractedData.downloadUrl);
    }

    // Extract ads array
    const adsMatch = html.match(/window\.ads\s*=\s*(\[[\s\S]*?\]);/);
    if (adsMatch) {
      try {
        extractedData.ads = JSON.parse(adsMatch[1]) as string[];
        console.log('✓ Ads:', extractedData.ads.length, 'entries');
      } catch (e) {
        console.error('✗ Ads JSON parse failed:', e);
      }
    }

    // Extract timelinesEnabled
    const timelinesMatch = html.match(/window\.timelinesEnabled\s*=\s*(\d+)/);
    if (timelinesMatch) {
      extractedData.timelinesEnabled = parseInt(timelinesMatch[1]) === 1;
      console.log('✓ Timelines enabled:', extractedData.timelinesEnabled);
    }

    // Extract info from h1 and .meta
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const info: ExtractedInfo = {};

      // Title and HD
      const h1 = doc.querySelector('.h_info .l_info h1');
      if (h1) {
        info.title = h1.childNodes[0]?.textContent?.trim() || h1.textContent?.replace(/<i.*<\/i>/, '').trim() || '';
        info.isHD = !!h1.querySelector('.hd_mark');
      }

      // Likes, Dislikes, Views
      const meta = doc.querySelector('.h_info .l_info .meta');
      if (meta) {
        const like = meta.querySelector('.like span');
        const dislike = meta.querySelector('.dislike span');
        const viewsSpan = Array.from(meta.querySelectorAll('span')).find(
          s => s.textContent?.includes('views')
        );
        info.likes = like?.textContent?.trim() || '';
        info.dislikes = dislike?.textContent?.trim() || '';
        info.views = viewsSpan?.textContent?.replace(/[^0-9.KM]/g, '').trim() || '';
      }

      // Description
      const desc = doc.querySelector('.video_info .description');
      if (desc) {
        info.description = desc.textContent?.trim() || '';
      }

      extractedData.info = info;
    } catch (e) {
      console.error('✗ Info extraction failed:', e);
    }

  } catch (err) {
    console.error('✗ Failed to extract data:', err);
    throw err;
  }

  return extractedData;
}





// Helper: sleep for ms milliseconds
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getHtmlAsync(
    targetUrl: string,
    timeout = 10000,
    headers?: Record<string, string>,
    cookies?: Record<string, string>,
    retries = 3
): Promise<string | null> {
    const defaultHeaders: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    };
    if (headers) Object.assign(defaultHeaders, headers);
    if (cookies) {
        defaultHeaders['Cookie'] = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
    }

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            const options: RequestInit = {
                headers: defaultHeaders,
                signal: controller.signal,
            };
            const res = await fetch(targetUrl, options);
            clearTimeout(id);
            if (res.status === 200) {
                return await res.text();
            }
            if ([404, 403, 401].includes(res.status)) break;
        } catch (e: any) {
            if (e.name === 'AbortError') {
                // Timeout
            }
        }
        if (attempt < retries - 1) await sleep((attempt + 1) * 2000);
    }
    return null;
}

export function extractUrlFromLoadIframe(htmlContent?: string): string | null {
    if (!htmlContent || !htmlContent.includes('function loadIframe')) return null;
    const pattern = /function loadIframe[\s\S]*?src:\s*['"]([^'"]+)['"]/;
    const match = htmlContent.match(pattern);
    return match ? match[1] : null;
}

export function extractM3u8FromPlayerjs(htmlContent?: string): string | null {
    if (!htmlContent || !htmlContent.includes('new Playerjs')) return null;
    const patterns = [
        /new Playerjs\s*\([^)]*file:\s*['"]([^'"]*\.m3u8[^'"]*)['"]/,
        /file:\s*['"]([^'"]*\.m3u8[^'"]*)['"]/,
        /file:\s*['"]([^'"]*master\.m3u8[^'"]*)['"]/,
        /['"]([^'"]*https?:\/\/[^'"]*\.m3u8[^'"]*)['"]/
    ];
    for (const pattern of patterns) {
        const match = htmlContent.match(pattern);
        if (match) return match[1];
    }
    return null;
}
// Updates the vidsrc link in the background using the provided API


export async function extractM3u8LinkAsync(
    imdbId: string,
    movieId: string,
    season?: string,
    episode?: string
): Promise<string | null> {
    try {
        const baseUrl = season && episode
            ? `https://vidsrc.net/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`
            : `https://vidsrc.net/embed/movie?imdb=${imdbId}`;

        const firstHtml = await getHtmlAsync(baseUrl, 15000);
        if (!firstHtml) return null;
        const parser = new DOMParser();
        const doc = parser.parseFromString(firstHtml, "text/html");
        const firstIframe = doc.querySelector("iframe#player_iframe")?.getAttribute("src");
        if (!firstIframe) return null;

        const secondUrl = firstIframe.startsWith('http') ? firstIframe : 'https:' + firstIframe;
        const parsedUrl = url.parse(secondUrl);
        const base = `${parsedUrl.protocol}//${parsedUrl.host}`;

        const secondHtml = await getHtmlAsync(secondUrl, 15000);
        if (!secondHtml) return null;

        const extractedUrl = extractUrlFromLoadIframe(secondHtml);
        if (!extractedUrl) return null;

        const thirdUrl = url.resolve(base, extractedUrl);
        const thirdHtml = await getHtmlAsync(thirdUrl, 20000);
        if (!thirdHtml) return null;

        const m3u8Link = extractM3u8FromPlayerjs(thirdHtml);
        if (!m3u8Link) return null;
        updateVidsrcLinkBackground(movieId, m3u8Link, season, episode, imdbId);
        return m3u8Link;
    } catch {
        return null;
    }
}

export function extractM3u8Link(
    imdbId: string,
    movieId: string,
    season?: string,
    episode?: string
): Promise<string | null> {
    return extractM3u8LinkAsync(imdbId, movieId, season, episode);
}
