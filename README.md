# Social Links — Black UI

A minimal, single-page site that displays links to Discord, Instagram and Steam with a completely black interface and white icons.

How to use

1. Open `index.html` in your browser (no build step required).
2. Replace the placeholder `href` values in `index.html` with your actual profile links.
3. Optional: host the folder (GitHub Pages, Netlify, etc.).

Customization tips

- Change colors in `styles.css` by editing the `--bg` and `--fg` variables.
- Replace the inline SVGs with any other icons you prefer.

Audio player

- Add an audio file named `song.mp3` to this folder or edit the `src` attribute on the `<audio>` element in `index.html` to point to an external URL.
- The player includes Play/Pause control, a seek bar, **volume control**, and **mute toggle**. The behavior is implemented in `player.js`. A default sample audio URL is used; replace the `src` attribute in `index.html` or add `song.mp3` to the folder.

Video background

- A background video `assets/sukuna-x-gojo-jujutsu-kaisen-moewalls-com.mp4` is set to autoplay, muted, and loop. The poster/fallback image is `assets/منكم.jpg`.
- If you want the video removed, replaced, or to show controls instead, edit or remove the `<video id="bgVideo">` element in `index.html`.

Music track

- Added `assets/musashi-thank-you.mp3` and wired it as the default audio source. The player shows the track title and the cover art `assets/fyp.jpg` is displayed in the player.
- To replace the track or the cover, overwrite `assets/musashi-thank-you.mp3` or `assets/fyp.jpg`, or update the respective `src` attributes in `index.html`.

Autoplay note

- The site will attempt to autoplay the audio on page load, but most browsers block autoplay of audible media until the user interacts with the page. If autoplay is blocked, the player will remain paused and will start when the user clicks play or interacts with the page.
Deploying to GitHub Pages

1) Create a new GitHub repository (for example, `social-links-site`).
2) Commit this project and push to the `main` branch:
   - git init
   - git add .
   - git commit -m "Initial site"
   - git remote add origin https://github.com/<your-user>/<your-repo>.git
   - git branch -M main
   - git push -u origin main
3) After pushing, the GitHub Actions workflow in `.github/workflows/deploy.yml` will upload the `social-links-site` directory and deploy it to GitHub Pages.

Notes

- The workflow uses the official Pages actions and only requires the default `GITHUB_TOKEN` (no extra secrets). After the first successful run, the Pages site will be available at `https://<your-user>.github.io/<your-repo>/` (it can take a minute to become active).
- If you prefer the site to be published from the repository root, move files from `social-links-site/` to the repo root and update the workflow `path` if needed.

