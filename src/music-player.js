export function initMusicPlayer() {
    const audio = document.querySelector("#ambient-audio");
    const button = document.querySelector("#music-toggle");

    if (!audio || !button) return;

    let musicEnabled = true;
    let sourceAvailable = true;
    audio.volume = 0.35;

    function updateButton(label, enabled = musicEnabled) {
        button.setAttribute("aria-pressed", String(enabled));
        button.setAttribute("aria-label", label);
        button.title = label;
    }

    function markSourceUnavailable() {
        sourceAvailable = false;
        musicEnabled = false;
        audio.pause();
        audio.muted = true;
        button.disabled = true;
        updateButton("Musik tidak tersedia", false);
    }

    audio.addEventListener("error", markSourceUnavailable, { once: true });

    if (audio.error) {
        markSourceUnavailable();
        return;
    }

    // Autoplay with sound is attempted; browsers may block it until user interaction.
    audio.muted = false;
    audio.play().catch(() => {
        musicEnabled = false;
        audio.pause();
        updateButton("Nyalakan musik", false);
    });

    // Stop playback when the page is hidden or the user switches tabs.
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && !audio.paused) {
            audio.pause();
        }
    });

    button.addEventListener("click", async () => {
        if (!sourceAvailable) return;

        if (musicEnabled && !audio.paused) {
            audio.pause();
            audio.muted = true;
            musicEnabled = false;
            updateButton("Nyalakan musik", false);
            return;
        }

        audio.muted = false;
        try {
            await audio.play();
            musicEnabled = true;
            updateButton("Matikan musik", true);
        } catch (error) {
            audio.muted = true;
            musicEnabled = false;
            updateButton("Coba nyalakan musik", false);
            console.error("Musik FlipPlay tidak dapat diputar:", error);
        }
    });
}
