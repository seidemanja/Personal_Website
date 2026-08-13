# Codex Project Instructions

## Production change control

- This website is a production system. Make only the exact changes the user requests.
- Do not make unrelated improvements, refactors, copy edits, dependency changes, formatting changes, or visual adjustments.
- Preserve all existing behavior and styling outside the explicitly requested scope.
- Before modifying UI, layout, typography, responsive behavior, rendering, snapshots, or hydration, read and follow `format_content.txt`. Treat it as the project's design and rendering contract unless the user explicitly requests an exception.
- The website resume lede must wrap on the same words as the lede in the most recently uploaded resume PDF. When a new resume PDF changes those line endings, update the website resume's fixed summary-line spans to match the new PDF.
- Run the verification appropriate to the requested change, including `npm run build` before handoff for code changes.
- Never modify, delete, stage, or commit `selected-work-twitter-final.png` or `selected-work-twitter-final-2.png` unless the user explicitly requests it.

## Analytics exclusion

- Localhost testing is not tracked by the site's production analytics and needs no exclusion setup.
- For every automated or manual Codex browser test against `seidemanphd.com` or `www.seidemanphd.com`, always launch Chrome with this persistent profile:
  `$HOME/Desktop/Personal Website/.codex-browser-profile`
- Before visiting any other production URL with that profile, visit:
  `https://www.seidemanphd.com/?exclude-me=1`
- Reuse this same profile for every subsequent production test. Do not use an ephemeral or different Chrome profile for production testing.
- Never visit `?exclude-me=0` with this profile.
- This exclusion is browser-profile-specific. It does not apply to another browser profile, browser, or device.
