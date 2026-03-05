# JellyFin-VR-360-Player
A custom 360° VR video player for Jellyfin, injected via any Javascript Plugin of your choice. Adds a **VR** button to the Jellyfin player that opens any video in a 360° spherical viewer with full playback controls. aFrame and Google apis are used. 

![License](https://img.shields.io/badge/License-AGPL--3.0-purple) ![Jellyfin](https://img.shields.io/badge/Jellyfin-10.11+-00a4dc?logo=jellyfin) ![Author](https://img.shields.io/badge/Author-Mix1C-ff69b4)

---

## Features

- 360° spherical video playback powered by A-Frame (open-sourced)
- Custom playback controls (play/pause, skip ±10s, seek bar, volume) that are similar to JellyFin's native player theme.
- Settings panel with:
    Theme selector (7 colour themes, saved across sessions)
- "Ends at" clock display
- Auto-hiding controls
- Keyboard shortcuts
- Fullscreen support
- Resumes from where Jellyfin left off

---

## Installation

**1. Install a Custom JavaScript plugin or injector. TamperMonkey also works.**

In Jellyfin, go to **Dashboard → Plugins → Repositories** and add a javascript injector. I highly recommend the following:

```
https://raw.githubusercontent.com/n00bcodr/jellyfin-plugins/main/10.11/manifest.json 
```

Then install **JavaScript Injector** from the Catalog Tab and restart Jellyfin.

**2. Add the player script**

- Download `jellyfin-vr.js` from this repository
- In Jellyfin, go to **Dashboard → JS Injector (Under Plugins)**
- Paste the contents of the file into the text box and save. 

**3. Done**

Refresh Jellyfin in your browser. When you play any video, a **VR** button will appear in the player controls next to the fullscreen button. If you add a new video, it might take a minute to load. 

---

## Usage

1. Start playing any 360° video in Jellyfin
2. Click the **VR** button in the player controls [[![Preview](https://github.com/Mix1C/JellyFin-VR-360-Player/blob/main/Preview/Default.png)
4. The 360° player will open, lick and drag to look around
5. Access settings via the **⚙** gear icon for speed, quality, repeat, and theme
6. Press **Escape** or click the back arrow (←) to return to Jellyfin

### Keyboard Shortcuts

`Space` | Play / Pause |
`←` `→` | Seek back / forward 5s |
`M` | Mute / Unmute |
`F` | Toggle Fullscreen |
`Escape` | Close VR player |

---

## Themes

Open **Settings → Theme** to choose an accent colour. Your choice is saved automatically.
![Themes](https://github.com/Mix1C/JellyFin-VR-360-Player/blob/main/Preview/VR.png)

---

## Dependencies

This project uses the following libraries, which are loaded from public CDNs and are not covered by this project's license:

- [A-Frame 1.5.0](https://aframe.io) by Mozilla — MIT License
- [Material Icons](https://fonts.google.com/icons) by Google — Apache 2.0 License

---

## License

Copyright (C) 2026 Mix1C

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. You are free to use, modify, and distribute this software for non-commercial and personal purposes, provided that any modifications are also released under the same license. See the [LICENSE](LICENSE) file for full details.
