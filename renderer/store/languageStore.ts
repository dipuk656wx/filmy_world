import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Translation {
  [key: string]: string | Translation;
}

export interface LanguageConfig {
  code: string;           // ISO 639-1 code
  tmdbCode: string;      // TMDb API language code (some differ from ISO)
  name: string;          // English name
  nativeName: string;    // Native name
  flag: string;          // Unicode flag emoji
  rtl?: boolean;         // Right-to-left reading direction
  region?: string;       // Preferred region for API calls
  translations: Translation;
}

// Base translations for all languages
const baseTranslations: Translation = {
  // Navigation
  movies: 'Movies',
  tvShows: 'TV Shows',
  people: 'People',
  search: 'Search movies, TV shows, people...',
  
  // Home page
  trendingMovies: 'Trending Movies',
  popularMovies: 'Popular Movies',
  trendingTVShows: 'Trending TV Shows',
  upcomingMovies: 'Upcoming Movies',
  topRatedMovies: 'Top Rated Movies',
  nowPlaying: 'Now Playing',
  
  // Categories
  popular: 'Popular',
  topRated: 'Top Rated',
  trending: 'Trending',
  upcoming: 'Upcoming',
  airingToday: 'Airing Today',
  onTheAir: 'On The Air',
  
  // Content details
  watchNow: 'Watch Now',
  releaseDate: 'Release Date',
  firstAirDate: 'First Air Date',
  lastAirDate: 'Last Air Date',
  runtime: 'Runtime',
  rating: 'Rating',
  overview: 'Overview',
  genres: 'Genres',
  cast: 'Cast',
  crew: 'Crew',
  director: 'Director',
  writer: 'Writer',
  producer: 'Producer',
  
  // Person details
  knownFor: 'Known For',
  birthday: 'Birthday',
  deathday: 'Date of Death',
  placeOfBirth: 'Place of Birth',
  biography: 'Biography',
  popularity: 'Popularity',
  allCredits: 'All Credits',
  filmography: 'Filmography',
  
  // TV Show details
  seasons: 'Seasons',
  episodes: 'Episodes',
  season: 'Season',
  episode: 'Episode',
  numberOfSeasons: 'Number of Seasons',
  numberOfEpisodes: 'Number of Episodes',
  status: 'Status',
  network: 'Network',
  type: 'Type',
  
  // Common UI
  loading: 'Loading...',
  error: 'Error loading content',
  loadMore: 'Load More',
  viewAll: 'View All',
  year: 'Year',
  years: 'Years',
  minute: 'minute',
  minutes: 'minutes',
  page: 'Page',
  of: 'of',
  results: 'results',
  noResults: 'No results found',
  tryAgain: 'Try Again',
  
  // Language and settings
  language: 'Language',
  languageDetected: 'Language Detected',
  settings: 'Settings',
  preferences: 'Preferences',
  
  // TMDb Attribution
  tmdbAttribution: 'This product uses the TMDb API but is not endorsed or certified by TMDb.',
  poweredByTmdb: 'Powered by TMDb',
  
  // Search
  searchResults: 'Search Results',
  searchFor: 'Search for',
  noSearchResults: 'No results found for your search',
  
  // Filters
  sortBy: 'Sort By',
  filterBy: 'Filter By',
  releaseYear: 'Release Year',
  genre: 'Genre',
  country: 'Country',
  
  // Actions
  play: 'Play',
  trailer: 'Trailer',
  favorite: 'Favorite',
  watchlist: 'Watchlist',
  share: 'Share',
  download: 'Download',
  
  // Quality
  quality: 'Quality',
  resolution: 'Resolution',
  hd: 'HD',
  fullHD: '1080p',
  ultraHD: '4K',
  
  // Time
  today: 'Today',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  thisYear: 'This Year',
};

// Language configurations with comprehensive translations
export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  // English (Default)
  en: {
    code: 'en',
    tmdbCode: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    region: 'US',
    translations: { ...baseTranslations }
  },

  // Spanish
  es: {
    code: 'es',
    tmdbCode: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    region: 'ES',
    translations: {
      ...baseTranslations,
      movies: 'Películas',
      tvShows: 'Series de TV',
      people: 'Personas',
      search: 'Buscar películas, series, personas...',
      
      trendingMovies: 'Películas en Tendencia',
      popularMovies: 'Películas Populares',
      trendingTVShows: 'Series en Tendencia',
      upcomingMovies: 'Próximas Películas',
      topRatedMovies: 'Películas Mejor Valoradas',
      nowPlaying: 'En Cartelera',
      
      popular: 'Populares',
      topRated: 'Mejor Valoradas',
      trending: 'Tendencia',
      upcoming: 'Próximas',
      airingToday: 'Hoy en Emisión',
      onTheAir: 'En Emisión',
      
      watchNow: 'Ver Ahora',
      releaseDate: 'Fecha de Estreno',
      firstAirDate: 'Fecha de Primera Emisión',
      lastAirDate: 'Fecha de Última Emisión',
      runtime: 'Duración',
      rating: 'Calificación',
      overview: 'Sinopsis',
      genres: 'Géneros',
      cast: 'Reparto',
      crew: 'Equipo',
      director: 'Director',
      writer: 'Guionista',
      producer: 'Productor',
      
      knownFor: 'Conocido por',
      birthday: 'Cumpleaños',
      deathday: 'Fecha de Fallecimiento',
      placeOfBirth: 'Lugar de Nacimiento',
      biography: 'Biografía',
      popularity: 'Popularidad',
      allCredits: 'Todos los Créditos',
      filmography: 'Filmografía',
      
      seasons: 'Temporadas',
      episodes: 'Episodios',
      season: 'Temporada',
      episode: 'Episodio',
      numberOfSeasons: 'Número de Temporadas',
      numberOfEpisodes: 'Número de Episodios',
      status: 'Estado',
      network: 'Cadena',
      type: 'Tipo',
      
      loading: 'Cargando...',
      error: 'Error al cargar contenido',
      loadMore: 'Cargar Más',
      viewAll: 'Ver Todo',
      year: 'Año',
      years: 'Años',
      minute: 'minuto',
      minutes: 'minutos',
      page: 'Página',
      of: 'de',
      results: 'resultados',
      noResults: 'No se encontraron resultados',
      tryAgain: 'Intentar de Nuevo',
      
      language: 'Idioma',
      languageDetected: 'Idioma Detectado',
      settings: 'Configuración',
      preferences: 'Preferencias',
      
      tmdbAttribution: 'Este producto usa la API de TMDb pero no está respaldado o certificado por TMDb.',
      poweredByTmdb: 'Desarrollado con TMDb',
      
      searchResults: 'Resultados de Búsqueda',
      searchFor: 'Buscar',
      noSearchResults: 'No se encontraron resultados para tu búsqueda',
      
      sortBy: 'Ordenar Por',
      filterBy: 'Filtrar Por',
      releaseYear: 'Año de Estreno',
      genre: 'Género',
      country: 'País',
      
      play: 'Reproducir',
      trailer: 'Tráiler',
      favorite: 'Favorito',
      watchlist: 'Lista de Seguimiento',
      share: 'Compartir',
      download: 'Descargar',
      
      quality: 'Calidad',
      resolution: 'Resolución',
      hd: 'HD',
      fullHD: '1080p',
      ultraHD: '4K',
      
      today: 'Hoy',
      thisWeek: 'Esta Semana',
      thisMonth: 'Este Mes',
      thisYear: 'Este Año',
    }
  },

  // French
  fr: {
    code: 'fr',
    tmdbCode: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    region: 'FR',
    translations: {
      ...baseTranslations,
      movies: 'Films',
      tvShows: 'Séries TV',
      people: 'Personnes',
      search: 'Rechercher films, séries, personnes...',
      
      trendingMovies: 'Films Tendance',
      popularMovies: 'Films Populaires',
      trendingTVShows: 'Séries Tendance',
      upcomingMovies: 'Films à Venir',
      topRatedMovies: 'Films les Mieux Notés',
      nowPlaying: 'À l\'Affiche',
      
      popular: 'Populaires',
      topRated: 'Mieux Notés',
      trending: 'Tendance',
      upcoming: 'À Venir',
      airingToday: 'Diffusés Aujourd\'hui',
      onTheAir: 'En Cours',
      
      watchNow: 'Regarder',
      releaseDate: 'Date de Sortie',
      firstAirDate: 'Première Diffusion',
      lastAirDate: 'Dernière Diffusion',
      runtime: 'Durée',
      rating: 'Note',
      overview: 'Synopsis',
      genres: 'Genres',
      cast: 'Distribution',
      crew: 'Équipe',
      director: 'Réalisateur',
      writer: 'Scénariste',
      producer: 'Producteur',
      
      knownFor: 'Connu pour',
      birthday: 'Anniversaire',
      deathday: 'Date de Décès',
      placeOfBirth: 'Lieu de Naissance',
      biography: 'Biographie',
      popularity: 'Popularité',
      allCredits: 'Tous les Crédits',
      filmography: 'Filmographie',
      
      seasons: 'Saisons',
      episodes: 'Épisodes',
      season: 'Saison',
      episode: 'Épisode',
      numberOfSeasons: 'Nombre de Saisons',
      numberOfEpisodes: 'Nombre d\'Épisodes',
      status: 'Statut',
      network: 'Chaîne',
      type: 'Type',
      
      loading: 'Chargement...',
      error: 'Erreur de chargement',
      loadMore: 'Charger Plus',
      viewAll: 'Voir Tout',
      year: 'Année',
      years: 'Années',
      minute: 'minute',
      minutes: 'minutes',
      page: 'Page',
      of: 'de',
      results: 'résultats',
      noResults: 'Aucun résultat trouvé',
      tryAgain: 'Réessayer',
      
      language: 'Langue',
      languageDetected: 'Langue Détectée',
      settings: 'Paramètres',
      preferences: 'Préférences',
      
      tmdbAttribution: 'Ce produit utilise l\'API TMDb mais n\'est ni approuvé ni certifié par TMDb.',
      poweredByTmdb: 'Propulsé par TMDb',
      
      searchResults: 'Résultats de Recherche',
      searchFor: 'Rechercher',
      noSearchResults: 'Aucun résultat trouvé pour votre recherche',
      
      sortBy: 'Trier Par',
      filterBy: 'Filtrer Par',
      releaseYear: 'Année de Sortie',
      genre: 'Genre',
      country: 'Pays',
      
      play: 'Lire',
      trailer: 'Bande-annonce',
      favorite: 'Favori',
      watchlist: 'Liste de Suivi',
      share: 'Partager',
      download: 'Télécharger',
      
      quality: 'Qualité',
      resolution: 'Résolution',
      hd: 'HD',
      fullHD: '1080p',
      ultraHD: '4K',
      
      today: 'Aujourd\'hui',
      thisWeek: 'Cette Semaine',
      thisMonth: 'Ce Mois',
      thisYear: 'Cette Année',
    }
  },

  // German
  de: {
    code: 'de',
    tmdbCode: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    region: 'DE',
    translations: {
      ...baseTranslations,
      movies: 'Filme',
      tvShows: 'TV-Serien',
      people: 'Personen',
      search: 'Filme, Serien, Personen suchen...',
      
      trendingMovies: 'Trending Filme',
      popularMovies: 'Beliebte Filme',
      trendingTVShows: 'Trending Serien',
      upcomingMovies: 'Kommende Filme',
      topRatedMovies: 'Top Bewertete Filme',
      nowPlaying: 'Aktuell im Kino',
      
      popular: 'Beliebt',
      topRated: 'Top Bewertet',
      trending: 'Trending',
      upcoming: 'Kommend',
      airingToday: 'Heute im TV',
      onTheAir: 'Aktuell im TV',
      
      watchNow: 'Jetzt Ansehen',
      releaseDate: 'Erscheinungsdatum',
      firstAirDate: 'Erste Ausstrahlung',
      lastAirDate: 'Letzte Ausstrahlung',
      runtime: 'Laufzeit',
      rating: 'Bewertung',
      overview: 'Handlung',
      genres: 'Genres',
      cast: 'Besetzung',
      crew: 'Crew',
      director: 'Regisseur',
      writer: 'Drehbuchautor',
      producer: 'Produzent',
      
      knownFor: 'Bekannt für',
      birthday: 'Geburtstag',
      deathday: 'Todestag',
      placeOfBirth: 'Geburtsort',
      biography: 'Biographie',
      popularity: 'Popularität',
      allCredits: 'Alle Auftritte',
      filmography: 'Filmographie',
      
      seasons: 'Staffeln',
      episodes: 'Episoden',
      season: 'Staffel',
      episode: 'Episode',
      numberOfSeasons: 'Anzahl Staffeln',
      numberOfEpisodes: 'Anzahl Episoden',
      status: 'Status',
      network: 'Sender',
      type: 'Typ',
      
      loading: 'Lädt...',
      error: 'Fehler beim Laden',
      loadMore: 'Mehr Laden',
      viewAll: 'Alle Anzeigen',
      year: 'Jahr',
      years: 'Jahre',
      minute: 'Minute',
      minutes: 'Minuten',
      page: 'Seite',
      of: 'von',
      results: 'Ergebnisse',
      noResults: 'Keine Ergebnisse gefunden',
      tryAgain: 'Erneut Versuchen',
      
      language: 'Sprache',
      languageDetected: 'Sprache Erkannt',
      settings: 'Einstellungen',
      preferences: 'Einstellungen',
      
      tmdbAttribution: 'Dieses Produkt nutzt die TMDb API, ist aber nicht von TMDb unterstützt oder zertifiziert.',
      poweredByTmdb: 'Unterstützt von TMDb',
      
      searchResults: 'Suchergebnisse',
      searchFor: 'Suchen nach',
      noSearchResults: 'Keine Ergebnisse für Ihre Suche gefunden',
      
      sortBy: 'Sortieren Nach',
      filterBy: 'Filtern Nach',
      releaseYear: 'Erscheinungsjahr',
      genre: 'Genre',
      country: 'Land',
      
      play: 'Abspielen',
      trailer: 'Trailer',
      favorite: 'Favorit',
      watchlist: 'Watchlist',
      share: 'Teilen',
      download: 'Herunterladen',
      
      quality: 'Qualität',
      resolution: 'Auflösung',
      hd: 'HD',
      fullHD: '1080p',
      ultraHD: '4K',
      
      today: 'Heute',
      thisWeek: 'Diese Woche',
      thisMonth: 'Diesen Monat',
      thisYear: 'Dieses Jahr',
    }
  },

  // Italian
  it: {
    code: 'it',
    tmdbCode: 'it-IT',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    region: 'IT',
    translations: {
      ...baseTranslations,
      movies: 'Film',
      tvShows: 'Serie TV',
      people: 'Persone',
      search: 'Cerca film, serie TV, persone...',
      
      trendingMovies: 'Film di Tendenza',
      popularMovies: 'Film Popolari',
      trendingTVShows: 'Serie TV di Tendenza',
      upcomingMovies: 'Prossimi Film',
      topRatedMovies: 'Film Più Votati',
      nowPlaying: 'Al Cinema',
      
      popular: 'Popolari',
      topRated: 'Più Votati',
      trending: 'Di Tendenza',
      upcoming: 'In Arrivo',
      airingToday: 'In Onda Oggi',
      onTheAir: 'In Onda',
      
      watchNow: 'Guarda Ora',
      releaseDate: 'Data di Uscita',
      runtime: 'Durata',
      rating: 'Valutazione',
      overview: 'Trama',
      genres: 'Generi',
      cast: 'Cast',
      
      loading: 'Caricamento...',
      error: 'Errore nel caricamento',
      loadMore: 'Carica Altri',
      year: 'Anno',
      language: 'Lingua',
    }
  },

  // Portuguese
  pt: {
    code: 'pt',
    tmdbCode: 'pt-BR',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    region: 'BR',
    translations: {
      ...baseTranslations,
      movies: 'Filmes',
      tvShows: 'Séries de TV',
      people: 'Pessoas',
      search: 'Pesquisar filmes, séries, pessoas...',
      
      trendingMovies: 'Filmes em Alta',
      popularMovies: 'Filmes Populares',
      trendingTVShows: 'Séries em Alta',
      
      popular: 'Populares',
      topRated: 'Mais Votados',
      trending: 'Em Alta',
      upcoming: 'Próximos',
      
      watchNow: 'Assistir Agora',
      releaseDate: 'Data de Lançamento',
      runtime: 'Duração',
      rating: 'Avaliação',
      overview: 'Sinopse',
      
      loading: 'Carregando...',
      error: 'Erro ao carregar',
      loadMore: 'Carregar Mais',
      year: 'Ano',
      language: 'Idioma',
    }
  },

  // Russian
  ru: {
    code: 'ru',
    tmdbCode: 'ru-RU',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    region: 'RU',
    translations: {
      ...baseTranslations,
      movies: 'Фильмы',
      tvShows: 'Сериалы',
      people: 'Люди',
      search: 'Поиск фильмов, сериалов, актёров...',
      
      trendingMovies: 'Популярные Фильмы',
      popularMovies: 'Популярные Фильмы',
      trendingTVShows: 'Популярные Сериалы',
      
      popular: 'Популярные',
      topRated: 'Топ Рейтинг',
      trending: 'В Тренде',
      upcoming: 'Скоро',
      
      watchNow: 'Смотреть',
      releaseDate: 'Дата Выхода',
      runtime: 'Длительность',
      rating: 'Рейтинг',
      overview: 'Описание',
      
      loading: 'Загрузка...',
      error: 'Ошибка загрузки',
      loadMore: 'Загрузить Ещё',
      year: 'Год',
      language: 'Язык',
    }
  },

  // Japanese
  ja: {
    code: 'ja',
    tmdbCode: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    region: 'JP',
    translations: {
      ...baseTranslations,
      movies: '映画',
      tvShows: 'テレビ番組',
      people: '人物',
      search: '映画、テレビ番組、人物を検索...',
      
      trendingMovies: 'トレンド映画',
      popularMovies: '人気映画',
      trendingTVShows: 'トレンドTV番組',
      
      popular: '人気',
      topRated: '高評価',
      trending: 'トレンド',
      upcoming: '公開予定',
      
      watchNow: '今すぐ視聴',
      releaseDate: '公開日',
      runtime: '上映時間',
      rating: '評価',
      overview: 'あらすじ',
      
      loading: '読み込み中...',
      error: '読み込みエラー',
      loadMore: 'もっと見る',
      year: '年',
      language: '言語',
    }
  },

  // Korean
  ko: {
    code: 'ko',
    tmdbCode: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    region: 'KR',
    translations: {
      ...baseTranslations,
      movies: '영화',
      tvShows: 'TV 프로그램',
      people: '인물',
      search: '영화, TV 프로그램, 인물 검색...',
      
      trendingMovies: '인기 영화',
      popularMovies: '인기 영화',
      trendingTVShows: '인기 TV 프로그램',
      
      popular: '인기',
      topRated: '평점 높은',
      trending: '인기 상승',
      upcoming: '개봉 예정',
      
      watchNow: '지금 시청',
      releaseDate: '개봉일',
      runtime: '상영시간',
      rating: '평점',
      overview: '줄거리',
      
      loading: '로딩 중...',
      error: '로딩 오류',
      loadMore: '더 보기',
      year: '년',
      language: '언어',
    }
  },

  // Chinese Simplified
  zh: {
    code: 'zh',
    tmdbCode: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '中文(简体)',
    flag: '🇨🇳',
    region: 'CN',
    translations: {
      ...baseTranslations,
      movies: '电影',
      tvShows: '电视剧',
      people: '人物',
      search: '搜索电影、电视剧、人物...',
      
      trendingMovies: '热门电影',
      popularMovies: '热门电影',
      trendingTVShows: '热门电视剧',
      
      popular: '热门',
      topRated: '高评分',
      trending: '热门趋势',
      upcoming: '即将上映',
      
      watchNow: '立即观看',
      releaseDate: '上映日期',
      runtime: '时长',
      rating: '评分',
      overview: '简介',
      
      loading: '加载中...',
      error: '加载错误',
      loadMore: '加载更多',
      year: '年',
      language: '语言',
    }
  },

  // Arabic
  ar: {
    code: 'ar',
    tmdbCode: 'ar-SA',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    region: 'SA',
    rtl: true,
    translations: {
      ...baseTranslations,
      movies: 'أفلام',
      tvShows: 'مسلسلات',
      people: 'أشخاص',
      search: 'البحث عن أفلام، مسلسلات، أشخاص...',
      
      trendingMovies: 'أفلام رائجة',
      popularMovies: 'أفلام شائعة',
      trendingTVShows: 'مسلسلات رائجة',
      
      popular: 'شائع',
      topRated: 'الأعلى تقييماً',
      trending: 'رائج',
      upcoming: 'قريباً',
      
      watchNow: 'شاهد الآن',
      releaseDate: 'تاريخ الإصدار',
      runtime: 'المدة',
      rating: 'التقييم',
      overview: 'نبذة',
      
      loading: 'جاري التحميل...',
      error: 'خطأ في التحميل',
      loadMore: 'تحميل المزيد',
      year: 'سنة',
      language: 'اللغة',
    }
  },

  // Hindi
  hi: {
    code: 'hi',
    tmdbCode: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    region: 'IN',
    translations: {
      ...baseTranslations,
      movies: 'फ़िल्में',
      tvShows: 'टीवी शो',
      people: 'लोग',
      search: 'फ़िल्में, टीवी शो, लोग खोजें...',
      
      trendingMovies: 'चलन में फ़िल्में',
      popularMovies: 'लोकप्रिय फ़िल्में',
      trendingTVShows: 'चलन में टीवी शो',
      
      popular: 'लोकप्रिय',
      topRated: 'उच्च रेटेड',
      trending: 'चलन में',
      upcoming: 'आने वाली',
      
      watchNow: 'अभी देखें',
      releaseDate: 'रिलीज़ दिनांक',
      runtime: 'अवधि',
      rating: 'रेटिंग',
      overview: 'सारांश',
      
      loading: 'लोड हो रहा है...',
      error: 'लोडिंग त्रुटि',
      loadMore: 'और लोड करें',
      year: 'वर्ष',
      language: 'भाषा',
    }
  },

  // Turkish
  tr: {
    code: 'tr',
    tmdbCode: 'tr-TR',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    region: 'TR',
    translations: {
      ...baseTranslations,
      movies: 'Filmler',
      tvShows: 'TV Dizileri',
      people: 'Kişiler',
      search: 'Film, dizi, kişi ara...',
      
      trendingMovies: 'Trend Filmler',
      popularMovies: 'Popüler Filmler',
      trendingTVShows: 'Trend Diziler',
      
      popular: 'Popüler',
      topRated: 'En Yüksek Puanlı',
      trending: 'Trend',
      upcoming: 'Yakında',
      
      watchNow: 'Şimdi İzle',
      releaseDate: 'Çıkış Tarihi',
      runtime: 'Süre',
      rating: 'Puan',
      overview: 'Özet',
      
      loading: 'Yükleniyor...',
      error: 'Yükleme hatası',
      loadMore: 'Daha Fazla Yükle',
      year: 'Yıl',
      language: 'Dil',
    }
  },

  // Dutch
  nl: {
    code: 'nl',
    tmdbCode: 'nl-NL',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    region: 'NL',
    translations: {
      ...baseTranslations,
      movies: 'Films',
      tvShows: 'TV-series',
      people: 'Personen',
      search: 'Zoek films, tv-series, personen...',
      
      trendingMovies: 'Trending Films',
      popularMovies: 'Populaire Films',
      trendingTVShows: 'Trending TV-series',
      
      popular: 'Populair',
      topRated: 'Hoogst Beoordeeld',
      trending: 'Trending',
      upcoming: 'Binnenkort',
      
      watchNow: 'Nu Kijken',
      releaseDate: 'Release Datum',
      runtime: 'Speelduur',
      rating: 'Beoordeling',
      overview: 'Overzicht',
      
      loading: 'Laden...',
      error: 'Laad fout',
      loadMore: 'Meer Laden',
      year: 'Jaar',
      language: 'Taal',
    }
  },
};

export const DEFAULT_LANGUAGE = 'en';

interface LanguageStore {
  currentLanguage: string;
  isLoading: boolean;
  setLanguage: (languageCode: string) => void;
  detectLanguage: () => void;
  getTranslation: (key: string) => string;
  getCurrentLanguageConfig: () => LanguageConfig;
  getSupportedLanguages: () => Record<string, LanguageConfig>;
  getTMDbLanguageCode: () => string;
  getRegion: () => string;
  isRTL: () => boolean;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      currentLanguage: DEFAULT_LANGUAGE,
      isLoading: false,

      setLanguage: (languageCode: string) => {
        if (SUPPORTED_LANGUAGES[languageCode]) {
          set({ currentLanguage: languageCode });
          
          // Apply RTL styles if needed
          const config = SUPPORTED_LANGUAGES[languageCode];
          if (config.rtl) {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = languageCode;
          } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = languageCode;
          }
          
          // Dispatch custom event for components that need to react
          window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: languageCode
          }));
        }
      },

      detectLanguage: () => {
        const browserLang = navigator.language.split('-')[0];
        const supportedLang = SUPPORTED_LANGUAGES[browserLang] ? browserLang : DEFAULT_LANGUAGE;
        
        const currentLang = get().currentLanguage;
        if (currentLang === DEFAULT_LANGUAGE && supportedLang !== DEFAULT_LANGUAGE) {
          get().setLanguage(supportedLang);
        }
      },

      getTranslation: (key: string) => {
        const { currentLanguage } = get();
        const config = SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
        const translations = config.translations;
        
        // Support nested keys with dot notation (e.g., 'user.profile.name')
        const keys = key.split('.');
        let value: any = translations;
        
        for (const k of keys) {
          value = value[k];
          if (value === undefined) {
            // Fallback to English if key not found
            const englishTranslations = SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE].translations;
            let englishValue: any = englishTranslations;
            for (const ek of keys) {
              englishValue = englishValue[ek];
              if (englishValue === undefined) return key; // Return key itself if not found
            }
            return String(englishValue);
          }
        }
        
        return String(value);
      },

      getCurrentLanguageConfig: () => {
        const { currentLanguage } = get();
        return SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
      },

      getSupportedLanguages: () => SUPPORTED_LANGUAGES,

      getTMDbLanguageCode: () => {
        const config = get().getCurrentLanguageConfig();
        return config.tmdbCode;
      },

      getRegion: () => {
        const config = get().getCurrentLanguageConfig();
        return config.region || 'US';
      },

      isRTL: () => {
        const config = get().getCurrentLanguageConfig();
        return config.rtl || false;
      },
    }),
    {
      name: 'language-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentLanguage: state.currentLanguage }),
    }
  )
);

// Initialize language detection on app start
export const initializeLanguage = () => {
  const store = useLanguageStore.getState();
  store.detectLanguage();
};

// Hook for components to use translations
export const useTranslation = () => {
  const { 
    currentLanguage, 
    getTranslation, 
    setLanguage, 
    getCurrentLanguageConfig,
    getSupportedLanguages,
    getTMDbLanguageCode,
    getRegion,
    isRTL
  } = useLanguageStore();

  return {
    t: getTranslation,
    currentLanguage,
    setLanguage,
    languageConfig: getCurrentLanguageConfig(),
    supportedLanguages: getSupportedLanguages(),
    tmdbLanguageCode: getTMDbLanguageCode(),
    region: getRegion(),
    isRTL: isRTL(),
  };
};
