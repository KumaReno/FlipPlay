import { fetchCatalog, fetchTopCharacters, fetchTopMedia } from "./media-service.js";
import { createMediaView } from "./media-view.js";

export function initMediaExplorer() {
    const mediaGrid = document.querySelector("#media-grid");

    if (mediaGrid) {
        const view = createMediaView(mediaGrid, document.querySelector("#feed-status"));
        const searchInput = document.querySelector("#media-search");
        const browseButtons = [...document.querySelectorAll("[data-browse]")];
        const genreFilter = document.querySelector("#genre-filter");
        const ratingOrder = document.querySelector("#rating-order");
        const typeButtons = [...document.querySelectorAll("[data-type]")];
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let catalogMedia = [];
        let catalogCharacters = [];
        let media = [];
        let selectedBrowse = "popular";
        let selectedType = "all";
        let isCatalogSearch = false;
        let searchTimer;
        let searchController;
        let searchSequence = 0;

        function renderMedia() {
            if (!media.length && !isCatalogSearch) return;
            const visibleMedia = media.filter((item) => {
                const title = `${item.title} ${item.titleEnglish || ""} ${item.titleJapanese || ""}`.toLocaleLowerCase("id");
                const query = searchInput.value.trim().toLocaleLowerCase("id");
                const matchesSearch = isCatalogSearch || title.includes(query);
                const matchesType = selectedType === "all"
                    || item.type === selectedType;
                const selectedGenre = genreFilter.value;
                const matchesGenre = item.type === "character" || !selectedGenre || item.genres.some((genre) => String(genre.mal_id) === selectedGenre);
                return matchesSearch && matchesType && matchesGenre;
            });

            visibleMedia.sort((a, b) => {
                if (selectedBrowse === "rating") {
                    const scoreDifference = (a.score || 0) - (b.score || 0);
                    return ratingOrder.value === "asc" ? scoreDifference : -scoreDifference;
                }
                if (Number.isFinite(a.popularity) && Number.isFinite(b.popularity)) return a.popularity - b.popularity;
                if (Number.isFinite(a.popularity)) return -1;
                if (Number.isFinite(b.popularity)) return 1;
                return (b.members || 0) - (a.members || 0);
            });

            if (!visibleMedia.length) {
                view.render(visibleMedia);
                view.setStatus(`0 judul ditemukan dari ${media.length} pilihan.`);
                return;
            }
            view.render(visibleMedia);
            view.setStatus(`Menampilkan ${visibleMedia.length} dari ${media.length} pilihan.`);
        }

        function handleSearchInput() {
            window.clearTimeout(searchTimer);
            searchController?.abort();
            const query = searchInput.value.trim();
            const sequence = ++searchSequence;

            if (!query) {
                isCatalogSearch = false;
                if (selectedType === "character") {
                    if (catalogCharacters.length) {
                        media = [...catalogCharacters];
                        view.setBusy(false);
                        renderMedia();
                    } else {
                        loadCharacters();
                    }
                    return;
                }
                media = [...catalogMedia];
                view.setBusy(catalogMedia.length === 0);
                if (catalogMedia.length) {
                    renderMedia();
                    view.setStatus(`Menampilkan ${catalogMedia.length} judul pilihan.`);
                } else {
                    view.setStatus("Menyambungkan ke feed Tenrai...");
                }
                return;
            }

            if (query.length < 2) {
                isCatalogSearch = false;
                media = [...(selectedType === "character" ? catalogCharacters : catalogMedia)];
                view.setBusy(media.length === 0);
                renderMedia();
                view.setStatus("Ketik minimal 2 karakter untuk mencari di seluruh katalog.");
                return;
            }

            view.setBusy(true);
            const catalogLabel = selectedType === "character" ? "karakter" : "anime dan manga";
            view.setStatus(`Mencari "${query}" di katalog ${catalogLabel}...`);
            searchTimer = window.setTimeout(() => searchCatalog(query, sequence), 500);
        }

        async function searchCatalog(query, sequence) {
            const controller = new AbortController();
            searchController = controller;
            const timeoutId = window.setTimeout(() => controller.abort(), 10000);
            const types = selectedType === "character"
                ? ["characters"]
                : selectedType === "anime" ? ["anime"]
                    : selectedType === "manga" ? ["manga"] : ["anime", "manga"];

            try {
                const responses = await Promise.allSettled(
                    types.map((type) => fetchCatalog(type, query, controller.signal)),
                );

                if (sequence !== searchSequence) return;
                const successfulResults = responses.filter((result) => result.status === "fulfilled");
                media = successfulResults.flatMap((result) => result.value);
                if (!successfulResults.length) throw new Error("Pencarian katalog gagal.");

                isCatalogSearch = true;
                view.setBusy(false);
                renderMedia();
                if (successfulResults.length < types.length) {
                    view.setStatus("Sebagian hasil belum tersedia. Menampilkan sumber yang berhasil dicari.", "warning");
                }
            } catch (error) {
                if (sequence !== searchSequence || controller.signal.aborted && searchInput.value.trim() !== query) return;
                isCatalogSearch = true;
                view.showError({
                    signal: "SEARCH SIGNAL LOST / 503",
                    title: "Pencarian belum berhasil.",
                    description: "Tenrai mungkin sedang lambat atau koneksi API terhalang. Coba cari lagi.",
                    retryId: "retry-search",
                });
                view.setStatus("Pencarian katalog Tenrai gagal. Batas tunggu 10 detik.", "error");
                console.error("Gagal mencari katalog media:", error);
            } finally {
                window.clearTimeout(timeoutId);
            }
        }

        async function loadMedia() {
            catalogMedia = [];
            media = [];
            isCatalogSearch = false;
            view.showLoading();
            view.setStatus("Menyambungkan ke feed Tenrai...");
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), 10000);

            try {
                const { items, failures } = await fetchTopMedia(controller.signal);
                catalogMedia = items;
                if (!navigator.onLine) throw new Error("Koneksi internet terputus.");
                if (!catalogMedia.length) throw new Error("Feed tidak mengembalikan data.");

                if (!searchInput.value.trim()) {
                    media = [...catalogMedia];
                    view.setBusy(false);
                    renderMedia();
                    if (failures.length) view.setStatus("Sebagian feed belum tersedia. Menampilkan data yang berhasil dimuat.", "warning");
                }
            } catch (error) {
                if (!searchInput.value.trim() || searchInput.value.trim().length < 2) {
                    view.showError({
                        signal: "CONNECTION LOST / 503",
                        title: "Feed belum bisa dimuat.",
                        description: "Tenrai mungkin sedang lambat, atau koneksi API terhalang. Coba lagi beberapa saat.",
                        retryId: "retry-feed",
                    });
                    view.setStatus("Tidak ada respons dari Tenrai API. Batas tunggu 10 detik.", "error");
                }
                console.error("Gagal memuat feed media:", error);
            } finally {
                window.clearTimeout(timeoutId);
            }
        }

        async function loadCharacters() {
            media = [];
            isCatalogSearch = false;
            view.showLoading();
            view.setStatus("Memuat karakter anime dan manga dari Tenrai...");
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), 10000);

            try {
                catalogCharacters = await fetchTopCharacters(controller.signal);
                if (!catalogCharacters.length) throw new Error("Tenrai tidak mengembalikan karakter.");
                media = [...catalogCharacters];
                view.setBusy(false);
                renderMedia();
            } catch (error) {
                view.showError({
                    signal: "CHARACTER SIGNAL LOST / 503",
                    title: "Karakter belum bisa dimuat.",
                    description: "Tenrai mungkin sedang lambat, atau koneksi API terhalang. Coba lagi beberapa saat.",
                    retryId: "retry-character",
                });
                view.setStatus("Feed karakter Tenrai gagal dimuat.", "error");
                console.error("Gagal memuat karakter:", error);
            } finally {
                window.clearTimeout(timeoutId);
            }
        }

        searchInput.addEventListener("input", handleSearchInput);

        browseButtons.forEach((button) => {
            button.addEventListener("click", () => {
                selectedBrowse = button.dataset.browse;
                browseButtons.forEach((browseButton) => {
                    const active = browseButton === button;
                    browseButton.classList.toggle("is-active", active);
                    browseButton.setAttribute("aria-pressed", String(active));
                });
                renderMedia();
            });
        });

        ratingOrder.addEventListener("change", () => {
            selectedBrowse = "rating";
            browseButtons.forEach((button) => {
                const active = button.dataset.browse === selectedBrowse;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            renderMedia();
        });

        genreFilter.addEventListener("change", renderMedia);

        typeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                selectedType = button.dataset.type;
                typeButtons.forEach((typeButton) => {
                    const active = typeButton === button;
                    typeButton.classList.toggle("is-active", active);
                    typeButton.setAttribute("aria-pressed", String(active));
                });
                handleSearchInput();
            });
        });

        document.addEventListener("click", (event) => {
            if (event.target.closest("#retry-feed")) {
                if (selectedType === "character") loadCharacters();
                else loadMedia();
            }
            if (event.target.closest("#retry-character")) handleSearchInput();
            if (event.target.closest("#retry-search")) handleSearchInput();
        });
        window.addEventListener("offline", () => {
            searchController?.abort();
            catalogMedia = [];
            catalogCharacters = [];
            media = [];
            isCatalogSearch = false;
            view.showError({
                signal: "CONNECTION LOST / OFFLINE",
                title: "Koneksi internet terputus.",
                description: "Sambungkan kembali ke internet, lalu coba muat feed lagi.",
                retryId: "retry-feed",
            });
            view.setStatus("Tidak ada koneksi internet.", "error");
        });
        window.addEventListener("online", () => {
            if (selectedType === "character") {
                if (!catalogCharacters.length) loadCharacters();
            } else if (!catalogMedia.length) {
                loadMedia();
            }
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
                event.preventDefault();
                searchInput.focus();
            }
            if (event.key === "Escape" && document.activeElement === searchInput) searchInput.blur();
        });

        if (prefersReducedMotion.matches) document.documentElement.classList.add("reduce-motion");
        prefersReducedMotion.addEventListener("change", (event) => document.documentElement.classList.toggle("reduce-motion", event.matches));
        loadMedia();
    }
}
