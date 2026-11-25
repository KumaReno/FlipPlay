# FlipPlay

FlipPlay is an Indonesian-language entertainment discovery landing page for anime, manga, and related characters. The current frontend is a static HTML, Tailwind CSS, and vanilla JavaScript prototype.

## Requirements

- Node.js and npm
- A local static web server for browser preview (for example, the Live Server extension in VS Code)

## Setup

```sh
npm install
npm run build:css
```

Open the project through a local web server. Do not open `index.html` directly as a `file://` URL: browser security restrictions can prevent API requests from working.

During style development, run:

```sh
npm run watch:css
```

## Data source

The discovery grid requests public catalog data from Tenrai API. Feed availability, response time, data quality, and applicable usage terms depend on that external service. The browser currently calls the public API directly; a production deployment should use a backend proxy/cache with appropriate rate limiting and monitoring.

## Source layout

```text
index.html                 Page structure and content
src/main.js                Application entry point
src/character-carousel.js  Featured character carousel behavior
src/media-explorer.js      Search, filters, sorting, and event handling
src/media-service.js       Tenrai requests and API data normalization
src/media-view.js          Loading, error, empty states, and media cards
src/music-player.js        Background music playback and header control
src/main.css               Tailwind entry point and custom styles
src/output.css             Generated CSS; do not edit by hand
images/                    Local visual assets and brand mark
music/                     Licensed FlipPlay background music
```

JavaScript uses native ES modules. Serve the project over HTTP while developing so the browser can load module files and make API requests.

The music player uses `music/flipplay-theme.mp3`, loops playback, and pauses when the page tab is hidden. Browsers may block audible autoplay until the visitor interacts with the page. Confirm commercial usage rights before publishing.

## Production integration still required

- Implement the `POST /api/contact` endpoint before publishing the contact form. The endpoint must validate and safely handle submissions, apply spam protection, and return clear success/error responses.
- Confirm the intended hosting environment, production domain, and privacy/contact details.
- Confirm usage rights for character artwork and any third-party media images before commercial publication.
- Add automated checks and test the deployed experience across supported browsers, screen sizes, keyboard navigation, and network failure states.

The current project is a frontend prototype and must not be presented as a streaming or reading service: it provides discovery links and catalog metadata, not licensed playback or book delivery.

