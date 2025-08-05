import * as cheerio from 'cheerio';
import * as url from 'url';

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

export async function extractM3u8LinkAsync(
    imdbId: string,
    season?: number,
    episode?: number
): Promise<string | null> {
    try {
        const baseUrl = season && episode
            ? `https://vidsrc.xyz/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`
            : `https://vidsrc.xyz/embed/movie?imdb=${imdbId}`;

        const firstHtml = await getHtmlAsync(baseUrl, 15000);
        if (!firstHtml) return null;

        const $ = cheerio.load(firstHtml);
        const firstIframe = $('iframe#player_iframe').attr('src');
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

        return extractM3u8FromPlayerjs(thirdHtml);
    } catch {
        return null;
    }
}

export function extractM3u8Link(
    imdbId: string,
    season?: number,
    episode?: number
): Promise<string | null> {
    return extractM3u8LinkAsync(imdbId, season, episode);
}