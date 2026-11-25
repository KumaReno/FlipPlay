function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);
}

export function createMediaView(mediaGrid, statusElement) {
    function setStatus(message, kind = "") {
        statusElement.textContent = message;
        statusElement.className = `feed-status${kind ? ` is-${kind}` : ""}`;
    }

    function setBusy(isBusy) {
        mediaGrid.setAttribute("aria-busy", String(isBusy));
    }

    function showLoading(count = 6) {
        setBusy(true);
        mediaGrid.innerHTML = Array.from(
            { length: count },
            () => '<div class="loading-card" aria-hidden="true"></div>',
        ).join("");
    }

    function showError({ signal, title, description, retryId }) {
        setBusy(false);
        mediaGrid.innerHTML = `
            <div class="feed-error">
                <span>${escapeHTML(signal)}</span>
                <h3>${escapeHTML(title)}</h3>
                <p>${escapeHTML(description)}</p>
                <button type="button" id="${escapeHTML(retryId)}">
                    Coba lagi <span aria-hidden="true">&#8635;</span>
                </button>
            </div>
        `;
    }

    function render(items) {
        setBusy(false);

        if (!items.length) {
            mediaGrid.innerHTML = `
                <div class="empty-state">
                    <span>NO SIGNAL / 404</span>
                    <h3>Belum ada yang cocok.</h3>
                    <p>Coba kata kunci atau pilihan genre yang lain.</p>
                </div>
            `;
            return;
        }

        mediaGrid.innerHTML = items.map((item, index) => {
            const genres = item.genres
                .slice(0, 2)
                .map((genre) => escapeHTML(genre.name))
                .join(" / ") || "Featured";
            const image = escapeHTML(item.image || "");
            const href = /^https:\/\//i.test(item.url) ? escapeHTML(item.url) : "#explore";
            const score = item.type === "character"
                ? `&#9825; ${Number(item.members || 0).toLocaleString("id-ID")}`
                : Number.isFinite(item.score) ? item.score.toFixed(1) : "NEW";
            const mediaType = item.type === "character"
                ? "CHARACTER"
                : item.type === "manga" ? "MANGA" : "ANIME";

            return `
                <article class="media-card" style="--card-index:${index}" aria-label="${escapeHTML(item.title)}">
                    <a class="media-card-link" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="Lihat ${escapeHTML(item.title)} di MyAnimeList">
                        <div class="media-poster-wrap">
                            <img class="media-poster" src="${image}" alt="Sampul ${escapeHTML(item.title)}" loading="lazy">
                            <span class="media-score">&#9733; ${score}</span>
                            <span class="media-type">${mediaType}</span>
                            <span class="poster-index">${String(index + 1).padStart(2, "0")}</span>
                        </div>
                        <div class="media-card-copy">
                            <p class="media-genre">${genres}</p>
                            <h3>${escapeHTML(item.title)}</h3>
                            <div class="media-card-foot">
                                <span>${escapeHTML(item.format || item.status || "On the list")}</span>
                                <span class="card-arrow" aria-hidden="true">&#8599;</span>
                            </div>
                        </div>
                    </a>
                </article>
            `;
        }).join("");
    }

    return { render, setBusy, setStatus, showError, showLoading };
}
