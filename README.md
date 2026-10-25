# NovaReel Studio

A free, local-first YouTube creative studio for web and Android devices.

Features: original structured story ideas, scene prompts, scripts, titles, descriptions, hashtags, responsive editor, project save/load, animated storyboard preview and offline WebM export. All content stays on the device; no API keys, cloud bill, authentication or paid AI credits are required.

**Note:** This is a creative-planning and animated-storyboard MVP, not a photorealistic AI video-rendering or automatic YouTube-upload system.

## Run locally

Open `index.html` with a modern Chromium browser, or serve the folder with `python -m http.server 8080` for PWA/service worker functionality.

## Deployment

Deploy as a Render Static Site. Build command: `echo ready`. Publish directory: `.`.

## Android

Open the HTTPS site in Android Chrome, tap **Install app** (or **Add to Home screen**). It runs as an installable progressive web app. A signed APK / Play Store package requires an Android build toolchain and signing setup; it is not supplied in this MVP.

No external API is contacted. For production multi-device sync, generative text/video AI, YouTube OAuth publishing or Play Store distribution, separate opt-in integrations are required.
