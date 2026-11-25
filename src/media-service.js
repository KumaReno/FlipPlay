const API_BASE_URL = "https://api.tenrai.org/v1";
const RESULT_LIMIT = 12;
const SFW_QUERY = "&sfw&sfw-strict";

async function requestJSON(path, signal) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        signal,
        cache: "no-store",
    });

    if (!response.ok) throw new Error(`Tenrai API: HTTP ${response.status}`);
    return response.json();
}

export function normalizeMedia(items, type) {
    const safeItems = items.filter((item) => {
        const rating = String(item.rating || "").trim();
        const genres = [...(item.genres || []), ...(item.themes || [])];
        const adultRating = /^(?:R\+|Rx)(?:\s|$)/i.test(rating);
        const adultGenre = genres.some((genre) => /^(?:ecchi|hentai|erotica)$/i.test(genre.name || ""));
        return !adultRating && !adultGenre;
    });

    return safeItems.map((item) => ({
        type,
        title: item.title || item.title_english || "Untitled",
        titleEnglish: item.title_english || "",
        titleJapanese: item.title_japanese || "",
        image: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || "",
        score: item.score,
        popularity: item.popularity,
        members: item.members,
        status: item.status || "",
        episodes: item.episodes || 0,
        chapters: item.chapters || 0,
        format: item.type || (type === "manga" ? "Manga" : "Anime"),
        genres: [...(item.genres || []), ...(item.themes || [])],
        url: item.url,
    }));
}

export function normalizeCharacters(items) {
    return items.map((item) => {
        const appearances = [
            ...(item.anime || []).map((entry) => entry.anime?.title),
            ...(item.manga || []).map((entry) => entry.manga?.title),
        ].filter(Boolean);

        return {
            type: "character",
            title: item.name || "Unknown character",
            titleEnglish: item.name_kanji || "",
            titleJapanese: (item.nicknames || []).join(" "),
            image: item.images?.webp?.image_url || item.images?.jpg?.image_url || "",
            score: null,
            popularity: item.favorites ? -item.favorites : undefined,
            members: item.favorites || 0,
            status: "",
            episodes: 0,
            chapters: 0,
            format: appearances.slice(0, 2).join(" / ") || "Anime & Manga Character",
            genres: [],
            url: item.url,
        };
    });
}

export async function fetchCatalog(type, query, signal) {
    const queryString = new URLSearchParams({ q: query, limit: String(RESULT_LIMIT) });
    const payload = await requestJSON(`/${type}?${queryString}${SFW_QUERY}`, signal);
    const items = payload.data || [];

    return type === "characters"
        ? normalizeCharacters(items)
        : normalizeMedia(items, type);
}

export async function fetchTopMedia(signal) {
    const types = ["anime", "manga"];
    const results = await Promise.allSettled(types.map(async (type) => {
        const payload = await requestJSON(`/top/${type}?limit=${RESULT_LIMIT}${SFW_QUERY}`, signal);
        return normalizeMedia(payload.data || [], type);
    }));

    return {
        items: results
            .filter((result) => result.status === "fulfilled")
            .flatMap((result) => result.value),
        failures: results.filter((result) => result.status === "rejected"),
    };
}

export async function fetchTopCharacters(signal) {
    const payload = await requestJSON(`/top/characters?limit=${RESULT_LIMIT}${SFW_QUERY}`, signal);
    return normalizeCharacters(payload.data || []);
}
