export function initCharacterCarousel() {
    const characters = [
        {
            name: "Ai Hoshino",
            nickname: "Ai",
            anime: "Oshi no Ko",
            caption: "Senyum yang bersinar di atas panggung.",
            image: "./images/Ai_Hoshino.webp",
        },
        {
            name: "Frieren",
            nickname: "Frieren",
            anime: "Frieren: Beyond Journey's End",
            caption: "Penyihir elf yang memulai perjalanan setelah petualangan usai.",
            image: "./images/Frieren.webp",
        },
        {
            name: "Lelouch Lamperouge",
            nickname: "Lelouch",
            anime: "Code Geass",
            caption: "Strategi seorang pemimpin di balik topeng Zero.",
            image: "./images/Lelouch.png",
        },
        {
            name: "Maomao",
            nickname: "Maomao",
            anime: "The Apothecary Diaries",
            caption: "Peracik obat dengan rasa ingin tahu yang tajam.",
            image: "./images/Maomao.webp",
        },
        {
            name: "Oguri Cap",
            nickname: "Oguri",
            anime: "Umamusume: Cinderella Gray",
            caption: "Sang Cinderella dari Kasamatsu berlari mengejar mimpinya.",
            image: "./images/Oguri_Cap.webp",
        },
        {
            name: "Rimuru Tempest",
            nickname: "Rimuru",
            anime: "That Time I Got Reincarnated as a Slime",
            caption: "Petualangan baru dimulai dari kehidupan sebagai slime.",
            image: "./images/Rimuru.webp",
        },
        {
            name: "Senku Ishigami",
            nickname: "Senku",
            anime: "Dr. Stone",
            caption: "Membangun kembali peradaban dengan kekuatan sains.",
            image: "./images/Senku_Ishigami.webp",
        },
    ];

    const carousel = document.querySelector("#characters");

    if (carousel) {
        const imageStack = carousel.querySelector("#character-image-stack");
        const name = carousel.querySelector("#character-name");
        const anime = carousel.querySelector("#character-anime");
        const caption = carousel.querySelector("#character-caption");
        const backdropMark = carousel.querySelector("#character-backdrop-mark");
        const spotlightCopy = carousel.querySelector("#character-spotlight-copy");
        const spotlightRule = carousel.querySelector("#character-spotlight-rule");
        const count = carousel.querySelector("#character-count");
        const indicators = [...carousel.querySelectorAll(".character-dot")];
        const previous = carousel.querySelector("#character-prev");
        const next = carousel.querySelector("#character-next");
        const toggle = carousel.querySelector("#character-toggle");
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let currentIndex = 0;
        let transitionId = 0;
        let timer;
        let userPaused = false;
        let hoverPaused = false;

        function showCharacter(index) {
            const previousIndex = currentIndex;
            const rawDirection = index - previousIndex;
            const direction = Math.abs(rawDirection) > characters.length / 2
                ? -Math.sign(rawDirection)
                : Math.sign(rawDirection) || 1;
            const activeTransition = ++transitionId;
            currentIndex = (index + characters.length) % characters.length;
            const character = characters[currentIndex];

            const outgoingImage = imageStack.querySelector(".character-image.is-current");
            const incomingImage = document.createElement("img");
            incomingImage.className = "character-image is-next";
            incomingImage.style.setProperty("--slide-in-offset", `${direction * 64}px`);
            incomingImage.src = character.image;
            incomingImage.alt = `${character.name} dari ${character.anime}`;
            incomingImage.decoding = "async";

            let transitionStarted = false;
            const startTransition = () => {
                if (transitionStarted) return;
                transitionStarted = true;

                if (outgoingImage) {
                    outgoingImage.getAnimations().forEach((animation) => animation.cancel());
                    outgoingImage.classList.remove("is-current");
                    outgoingImage.style.zIndex = "1";
                    const exitAnimation = outgoingImage.animate(
                        [
                            { opacity: 1, transform: "translate3d(-50%, 0, 0) scale(1)", clipPath: "inset(0)" },
                            { opacity: 0, transform: `translate3d(calc(-50% + ${direction * -72}px), 0, 0) scale(.97)`, clipPath: direction > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
                        ],
                        { duration: reduceMotion.matches ? 180 : 680, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
                    );
                    exitAnimation.onfinish = () => outgoingImage.remove();
                }

                incomingImage.classList.remove("is-next");
                incomingImage.classList.add("is-current");
                imageStack.append(incomingImage);
                incomingImage.animate(
                    [
                        { opacity: 0, transform: `translate3d(calc(-50% + ${direction * 72}px), 0, 0) scale(.96)`, clipPath: direction > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
                        { opacity: 1, transform: "translate3d(-50%, 0, 0) scale(1)", clipPath: "inset(0)" },
                    ],
                    { duration: reduceMotion.matches ? 180 : 680, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
                );
            };

            incomingImage.addEventListener("load", startTransition, { once: true });
            imageStack.append(incomingImage);
            if (incomingImage.complete && incomingImage.naturalWidth) startTransition();

            const copyItems = [
                [spotlightCopy, spotlightCopy.textContent, 0],
                [spotlightRule, null, 45],
                [backdropMark, character.nickname, 30],
                [anime, character.anime, 70],
                [name, character.name, 0],
                [caption.previousElementSibling, null, 115],
                [caption, character.caption, 140],
            ];
            copyItems.forEach(([element, text, delay]) => {
                element.getAnimations().forEach((animation) => animation.cancel());
                const offset = direction * 32;
                const duration = reduceMotion.matches ? 110 : 170;
                const enterDuration = reduceMotion.matches ? 150 : 300;
                const exit = element.animate(
                    [
                        { opacity: 1, transform: "translate3d(0, 0, 0)" },
                        { opacity: 0, transform: `translate3d(${offset * -1}px, 0, 0)` },
                    ],
                    { duration, delay: reduceMotion.matches ? 0 : delay, easing: "ease-in", fill: "forwards" },
                );
                exit.onfinish = () => {
                    if (activeTransition !== transitionId) return;
                    exit.cancel();
                    if (text !== null) element.textContent = text;
                    element.animate(
                        [
                            { opacity: 0, transform: `translate3d(${offset}px, 0, 0)` },
                            { opacity: 1, transform: "translate3d(0, 0, 0)" },
                        ],
                        { duration: enterDuration, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
                    );
                };
            });
            count.innerHTML = `${String(currentIndex + 1).padStart(2, "0")} <span class="px-1 text-acid">/</span> ${String(characters.length).padStart(2, "0")}`;

            indicators.forEach((indicator, indicatorIndex) => {
                const active = indicatorIndex === currentIndex;
                indicator.classList.toggle("is-active", active);
                if (active) {
                    indicator.setAttribute("aria-current", "true");
                } else {
                    indicator.removeAttribute("aria-current");
                }
            });

        }

        function stopAutoplay() {
            window.clearInterval(timer);
            timer = undefined;
        }

        function updatePlaybackControl() {
            toggle.hidden = reduceMotion.matches;
            toggle.textContent = userPaused ? "▶" : "Ⅱ";
            toggle.setAttribute("aria-label", userPaused ? "Lanjutkan pergantian otomatis" : "Jeda pergantian otomatis");
            toggle.title = userPaused ? "Lanjutkan pergantian otomatis" : "Jeda pergantian otomatis";
        }

        function startAutoplay() {
            stopAutoplay();
            if (!reduceMotion.matches && !document.hidden && !userPaused && !hoverPaused) {
                timer = window.setInterval(() => showCharacter(currentIndex + 1), 6000);
            }
            updatePlaybackControl();
        }

        previous.addEventListener("click", () => {
            userPaused = true;
            stopAutoplay();
            updatePlaybackControl();
            showCharacter(currentIndex - 1);
        });

        next.addEventListener("click", () => {
            userPaused = true;
            stopAutoplay();
            updatePlaybackControl();
            showCharacter(currentIndex + 1);
        });

        indicators.forEach((indicator, index) => {
            indicator.addEventListener("click", () => {
                userPaused = true;
                stopAutoplay();
                updatePlaybackControl();
                showCharacter(index);
            });
        });

        toggle.addEventListener("click", () => {
            userPaused = !userPaused;
            startAutoplay();
        });

        carousel.addEventListener("pointerenter", () => {
            hoverPaused = true;
            stopAutoplay();
        });
        carousel.addEventListener("pointerleave", () => {
            hoverPaused = false;
            startAutoplay();
        });
        document.addEventListener("visibilitychange", startAutoplay);
        reduceMotion.addEventListener("change", startAutoplay);
        startAutoplay();
    }
}
