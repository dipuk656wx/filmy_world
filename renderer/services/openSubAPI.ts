
interface Jar {
  token: string;
}
export type SubtitleInfo = {
  IDSubtitleFile: string;
  SubFileName: string;
  MovieYear: string;
  SubDownloadLink: string;
  SubFormat: string; // Added to match the OpenSubtitles API response
  SubEncoding: string; // Added to match the OpenSubtitles API response
};
const Jar: Jar = {
  token: '',
};


const getSubtitlesFromOpenSubtitles = async (
  imdbId: string,
  languages: string,
  season?: string,
  episode?: string
): Promise<any> => {
  // Remove "tt" prefix if present, as rest.opensubtitles.org expects only the numeric part
  const imdbNumeric = imdbId.startsWith('tt') ? imdbId.slice(2) : imdbId;
  let apiUrl = `https://rest.opensubtitles.org/search/imdbid-${imdbNumeric}/sublanguageid-${languages}`;
  if (season && episode) {
    apiUrl = `https://rest.opensubtitles.org/search/episode-${episode}/imdbid-${imdbNumeric}/season-${season}/sublanguageid-${languages}`;
  }
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'trailers.to-UA', // Use 'User-Agent' instead of 'x-user-agent'
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    // Map the response to only include SubtitleInfo type
    const subtitles: SubtitleInfo[] = data.map((item: any) => ({
      IDSubtitleFile: item.IDSubtitleFile,
      SubFileName: item.SubFileName,
      MovieYear: item.MovieYear,
      SubDownloadLink: item.SubDownloadLink,
      SubFormat: item.SubFormat || 'vtt', // Default to 'vtt' if not provided
      SubEncoding: item.SubEncoding || 'utf-8', // Default to 'utf-
    }));
    return subtitles;
    return data;
  } catch (error: any) {
    console.error('Error fetching subtitles from rest.opensubtitles.org:', error.message);
    throw new Error(`Failed to fetch subtitles: ${error.message}`);
  }
};

const getVttLink = async (subtitleInfo: SubtitleInfo): Promise<string> => {
  const response = await fetch(subtitleInfo.SubDownloadLink);
  if (!response.ok) {
    throw new Error(`Failed to download subtitle: ${response.status}`);
  }
  const blob = await response.blob();

  const formData = new FormData();
  formData.append('sub_data', blob);
  formData.append('subformat', subtitleInfo.SubFormat);
  formData.append('sub_enc', subtitleInfo.SubEncoding);
  formData.append('sub_src', 'ops');
  formData.append('sub_id', subtitleInfo.IDSubtitleFile);
  const vttResponse = await fetch('https://vidsrc.net/get_sub_url', {
    method: 'POST',
    body: formData,
    headers: {
      // 'Content-Type' will be set automatically by the browser for FormData
      'accept': '*/*',
      'origin': 'https://vidsrc.net',
      'referer': 'https://vidsrc.net/',
      'x-requested-with': 'XMLHttpRequest',
    },
  });

  if (!vttResponse.ok) {
    throw new Error(`Failed to get VTT link: ${vttResponse.status}`);
  }

  const vttLink = await vttResponse.text();
  return vttLink;
}



export {getVttLink, getSubtitlesFromOpenSubtitles};


