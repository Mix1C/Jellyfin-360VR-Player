
(function () {

  const PLAYER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>360° VR Video Player</title>
    <!-- a frame vr rendering -->
    <script src="https://aframe.io/releases/1.5.0/aframe.min.js"><\/script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <style>
        * { box-sizing: border-box; }
        
        /* Material Icons setup */
        .material-icons {
            font-family: 'Material Icons';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-smoothing: antialiased;
        }
        
        body { 
            margin: 0; 
            overflow: hidden; 
            font-family: 'Noto Sans', sans-serif; 
            background: #000; 
            color: rgba(255,255,255,0.87); 
        }

        /* Main UI container at bottom */
        #ui {
            position: absolute;
            bottom: 0; 
            left: 0; 
            right: 0;
            z-index: 100;
            background: linear-gradient(to top, rgba(0,0,0,0.9) 50%, transparent 100%);
            color: #fff;
            padding: 8px 16px 20px;
            transition: opacity 0.4s ease;
            opacity: 1;
            pointer-events: auto;
        }
        
        /* Hidden state for UI auto-hide */
        #ui.hidden { 
            opacity: 0; 
            pointer-events: none; 
        }

        /* Video progress bar container */
        .progress-container {
            width: 100%;
            height: 4px;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
            cursor: pointer;
            position: relative;
            margin-bottom: 10px;
            transition: height 0.15s;
        }
        
        .progress-container:hover { 
            height: 6px; 
        }
        
        /* The blue fill that shows progress */
        .progress-fill {
            height: 100%;
            width: 0%;
            background: #00a4dc;
            border-radius: 2px;
            pointer-events: none;
            position: relative;
        }
        
        /* Little thumb that appears on hover */
        .progress-fill::after {
            content: '';
            position: absolute;
            right: -6px; 
            top: 50%;
            transform: translateY(-50%);
            width: 12px; 
            height: 12px;
            background: #fff;
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.15s;
        }
        
        .progress-container:hover .progress-fill::after { 
            opacity: 1; 
        }

        /* Row of control buttons */
        .control-row {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        /* Generic button style - matches Jellyfin aesthetic */
        .jf-btn {
            background: transparent;
            border: none;
            color: rgba(255,255,255,0.87);
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s, color 0.2s;
            flex-shrink: 0;
        }
        
        .jf-btn:hover { 
            background: rgba(255,255,255,0.15); 
            color: #fff; 
        }
        
        .jf-btn .material-icons { 
            font-size: 24px; 
        }
        
        .jf-btn.small .material-icons { 
            font-size: 20px; 
        }

        /* Time display text */
        .time {
            font-size: 13px;
            font-family: 'Noto Sans', sans-serif;
            color: rgba(255,255,255,0.87);
            white-space: nowrap;
            padding: 0 8px;
            flex-shrink: 0;
        }

        /* Volume control wrapper */
        .volume-wrap {
            position: relative;
            display: flex;
            align-items: center;
            flex-shrink: 0;
        }
        
        /* Vertical volume slider popup - shows on hover */
        .volume-popup {
            display: none;
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            background: #1c1c1c;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            padding: 12px 10px;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 120px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.6);
            z-index: 200;
        }
        
        .volume-wrap:hover .volume-popup,
        .volume-popup:hover { 
            display: flex; 
        }

        /* The actual slider input */
        .volume-slider-vert {
            writing-mode: vertical-lr;
            direction: rtl;
            appearance: none;
            -webkit-appearance: none;
            width: 4px;
            height: 90px;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
            outline: none;
            cursor: pointer;
            accent-color: #00a4dc;
        }
        
        /* Webkit slider thumb styling */
        .volume-slider-vert::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px; 
            height: 14px;
            border-radius: 50%;
            background: #fff;
            cursor: pointer;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
        }
        
        /* Firefox slider thumb */
        .volume-slider-vert::-moz-range-thumb {
            width: 14px; 
            height: 14px;
            border-radius: 50%;
            background: #fff;
            cursor: pointer;
            border: none;
        }

        /* "360°" badge indicator */
        .vr-badge {
            font-size: 11px;
            font-family: 'Noto Sans', sans-serif;
            font-weight: 700;
            letter-spacing: 0.5px;
            color: #00a4dc;
            border: 1px solid #00a4dc;
            padding: 2px 7px;
            border-radius: 3px;
            flex-shrink: 0;
        }

        .spacer { flex: 1; }

        /* Settings panel (main menu) */
        .settings-panel {
            display: none;
            position: fixed;
            bottom: 80px;
            right: 16px;
            background: #1c1c1c;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            min-width: 280px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.7);
            z-index: 9999;
            overflow: hidden;
        }
        
        .settings-panel.open { 
            display: block; 
        }

        /* Individual setting rows */
        .settings-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            cursor: pointer;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            transition: background 0.15s;
        }
        
        .settings-row:last-child { 
            border-bottom: none; 
        }
        
        .settings-row:hover { 
            background: rgba(255,255,255,0.07); 
        }

        .settings-label {
            font-family: 'Noto Sans', sans-serif;
            font-size: 14px;
            color: rgba(255,255,255,0.87);
        }
        
        .settings-value {
            font-family: 'Noto Sans', sans-serif;
            font-size: 14px;
            color: rgba(255,255,255,0.5);
        }

        /* Sub-panels for speed/quality/repeat settings */
        .settings-sub {
            display: none;
            position: fixed;
            bottom: 80px;
            right: 16px;
            background: #1c1c1c;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            min-width: 280px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.7);
            z-index: 9999;
            overflow: hidden;
        }
        
        .settings-sub.open { 
            display: block; 
        }

        /* Header of sub-panel with back arrow */
        .settings-sub-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 14px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            cursor: pointer;
        }
        
        .settings-sub-header:hover { 
            background: rgba(255,255,255,0.05); 
        }
        
        .settings-sub-header .material-icons { 
            font-size: 18px; 
            color: rgba(255,255,255,0.6); 
        }
        
        .settings-sub-header span.title {
            font-family: 'Noto Sans', sans-serif;
            font-size: 14px;
            color: rgba(255,255,255,0.87);
            font-weight: 600;
        }

        /* Individual options in sub-panels */
        .settings-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 20px;
            cursor: pointer;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            transition: background 0.15s;
        }
        
        .settings-option:last-child { 
            border-bottom: none; 
        }
        
        .settings-option:hover { 
            background: rgba(255,255,255,0.07); 
        }
        
        .settings-option.active .opt-label { 
            color: #00a4dc; 
        }
        
        /* Checkmark icon for active option */
        .settings-option .check-icon {
            font-size: 18px;
            color: #00a4dc;
            visibility: hidden;
        }
        
        .settings-option.active .check-icon { 
            visibility: visible; 
        }
        
        .opt-label {
            font-family: 'Noto Sans', sans-serif;
            font-size: 14px;
            color: rgba(255,255,255,0.87);
        }
    <\/style>
<\/head>
<body>
    <!-- Main control UI -->
    <div id="ui">
        <div class="progress-container" id="seekContainer">
            <div class="progress-fill" id="seekBar"><\/div>
        <\/div>

        <div class="control-row">
            <button class="jf-btn" id="playPauseBtn" title="Play/Pause">
                <span class="material-icons">play_arrow<\/span>
            <\/button>

            <button class="jf-btn small" id="skipBackBtn" title="Rewind 10s">
                <span class="material-icons">replay_10<\/span>
            <\/button>

            <button class="jf-btn small" id="skipFwdBtn" title="Forward 10s">
                <span class="material-icons">forward_10<\/span>
            <\/button>

            <div class="volume-wrap" id="volumeWrap">
                <button class="jf-btn small" id="muteBtn" title="Mute">
                    <span class="material-icons">volume_up<\/span>
                <\/button>
                <div class="volume-popup" id="volumePopup">
                    <input type="range" class="volume-slider-vert" id="volumeSlider" min="0" max="1" step="0.02" value="1">
                <\/div>
            <\/div>

            <span class="time" id="timeDisplay">0:00 / 0:00<\/span>
            <span class="time" id="endsAt"><\/span>

            <div class="spacer"><\/div>

            <span class="vr-badge">360°<\/span>

            <button class="jf-btn small" id="settingsBtn" title="Settings">
                <span class="material-icons">settings<\/span>
            <\/button>

            <button class="jf-btn" id="fullscreenBtn" title="Fullscreen">
                <span class="material-icons">fullscreen<\/span>
            <\/button>
        <\/div>
    <\/div>

    <!-- Settings main panel -->
    <div class="settings-panel" id="settingsPanel">
        <div class="settings-row" id="setSpeed">
            <span class="settings-label">Playback Speed<\/span>
            <span class="settings-value" id="speedLabel">1x<\/span>
        <\/div>
        <div class="settings-row" id="setQuality">
            <span class="settings-label">Quality<\/span>
            <span class="settings-value" id="qualityLabel">Auto<\/span>
        <\/div>
        <div class="settings-row" id="setRepeat">
            <span class="settings-label">Repeat Mode<\/span>
            <span class="settings-value" id="repeatLabel">None<\/span>
        <\/div>
    <\/div>

    <!-- Speed sub-panel -->
    <div class="settings-sub" id="speedPanel">
        <div class="settings-sub-header" id="speedBack">
            <span class="material-icons">chevron_left<\/span>
            <span class="title">Playback Speed<\/span>
        <\/div>
        <div class="settings-option" data-speed="0.25"><span class="material-icons check-icon">check<\/span><span class="opt-label">0.25x<\/span><\/div>
        <div class="settings-option" data-speed="0.5"><span class="material-icons check-icon">check<\/span><span class="opt-label">0.5x<\/span><\/div>
        <div class="settings-option" data-speed="0.75"><span class="material-icons check-icon">check<\/span><span class="opt-label">0.75x<\/span><\/div>
        <div class="settings-option active" data-speed="1"><span class="material-icons check-icon">check<\/span><span class="opt-label">1x<\/span><\/div>
        <div class="settings-option" data-speed="1.25"><span class="material-icons check-icon">check<\/span><span class="opt-label">1.25x<\/span><\/div>
        <div class="settings-option" data-speed="1.5"><span class="material-icons check-icon">check<\/span><span class="opt-label">1.5x<\/span><\/div>
        <div class="settings-option" data-speed="2"><span class="material-icons check-icon">check<\/span><span class="opt-label">2x<\/span><\/div>
    <\/div>

    <!-- Repeat sub-panel -->
    <div class="settings-sub" id="repeatPanel">
        <div class="settings-sub-header" id="repeatBack">
            <span class="material-icons">chevron_left<\/span>
            <span class="title">Repeat Mode<\/span>
        <\/div>
        <div class="settings-option active" data-repeat="none"><span class="material-icons check-icon">check<\/span><span class="opt-label">None<\/span><\/div>
        <div class="settings-option" data-repeat="one"><span class="material-icons check-icon">check<\/span><span class="opt-label">Repeat One<\/span><\/div>
        <div class="settings-option" data-repeat="all"><span class="material-icons check-icon">check<\/span><span class="opt-label">Repeat All<\/span><\/div>
    <\/div>

    <!-- Quality sub-panel -->
    <div class="settings-sub" id="qualityPanel">
        <div class="settings-sub-header" id="qualityBack">
            <span class="material-icons">chevron_left<\/span>
            <span class="title">Quality<\/span>
        <\/div>
        <div class="settings-option active" data-bitrate="0"><span class="material-icons check-icon">check<\/span><span class="opt-label">Auto<\/span><\/div>
        <div class="settings-option" data-bitrate="120000000"><span class="material-icons check-icon">check<\/span><span class="opt-label">Max<\/span><\/div>
        <div class="settings-option" data-bitrate="15000000"><span class="material-icons check-icon">check<\/span><span class="opt-label">15 Mbps<\/span><\/div>
        <div class="settings-option" data-bitrate="8000000"><span class="material-icons check-icon">check<\/span><span class="opt-label">8 Mbps<\/span><\/div>
        <div class="settings-option" data-bitrate="6000000"><span class="material-icons check-icon">check<\/span><span class="opt-label">6 Mbps<\/span><\/div>
        <div class="settings-option" data-bitrate="4000000"><span class="material-icons check-icon">check<\/span><span class="opt-label">4 Mbps<\/span><\/div>
        <div class="settings-option" data-bitrate="3000000"><span class="material-icons check-icon">check<\/span><span class="opt-label">3 Mbps<\/span><\/div>
        <div class="settings-option" data-bitrate="1500000"><span class="material-icons check-icon">check<\/span><span class="opt-label">1.5 Mbps<\/span><\/div>
        <div class="settings-option" data-bitrate="720000"><span class="material-icons check-icon">check<\/span><span class="opt-label">720 kbps<\/span><\/div>
        <div class="settings-option" data-bitrate="420000"><span class="material-icons check-icon">check<\/span><span class="opt-label">420 kbps<\/span><\/div>
    <\/div>

    <!-- 360 rendering / view -->
    <a-scene vr-mode-ui="enabled: false" background="color: #000000">
        <a-assets id="assets"><\/a-assets>
        <a-entity id="videosphere"
                  geometry="primitive: sphere; radius: 5000;"
                  material="shader: flat; side: back;"
                  rotation="0 180 0">
        <\/a-entity>
        <a-camera id="camera"
                  position="0 1.6 0"
                  look-controls="enabled: true"
                  wasd-controls-enabled="false">
        <\/a-camera>
    <\/a-scene>

    <script>
        // ui elements
        const ui            = document.getElementById('ui');
        const playPauseBtn  = document.getElementById('playPauseBtn');
        const playIcon      = playPauseBtn.querySelector('.material-icons');
        const skipBackBtn   = document.getElementById('skipBackBtn');
        const skipFwdBtn    = document.getElementById('skipFwdBtn');
        const muteBtn       = document.getElementById('muteBtn');
        const muteIcon      = muteBtn.querySelector('.material-icons');
        const seekContainer = document.getElementById('seekContainer');
        const seekBar       = document.getElementById('seekBar');
        const timeDisplay   = document.getElementById('timeDisplay');
        const endsAt        = document.getElementById('endsAt');
        const volumeSlider  = document.getElementById('volumeSlider');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const fsIcon        = fullscreenBtn.querySelector('.material-icons');
        const videosphere   = document.getElementById('videosphere');

        let videoElement = null;
        let hideTimer    = null;
        let muted        = false;

        // end time
        function updateEndsAt() {
            if (!videoElement || !videoElement.duration || isNaN(videoElement.duration)) return;
            
            const remaining = (videoElement.duration - videoElement.currentTime) / (videoElement.playbackRate || 1);
            const end = new Date(Date.now() + remaining * 1000);
            const hours = end.getHours();
            const minutes = end.getMinutes().toString().padStart(2,'0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const h12 = hours % 12 || 12;
            
            // Formatting the "Ends at" string with some extra spaces for padding
            endsAt.textContent = \`\u00a0\u00a0\u00a0\u00a0Ends at \${h12}:\${minutes} \${ampm}\`;
        }

        // Helper to format seconds into "M:SS"
        function formatTime(seconds) {
            if (isNaN(seconds)) return '0:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return \`\${mins}:\${secs.toString().padStart(2,'0')}\`;
        }

        // Update progress bar and time display
        function updateProgress() {
            if (!videoElement) return;
            
            const percentage = (videoElement.currentTime / videoElement.duration) * 100;
            seekBar.style.width = percentage + '%';
            timeDisplay.textContent = \`\${formatTime(videoElement.currentTime)} / \${formatTime(videoElement.duration)}\`;
            updateEndsAt();
        }

        // Seek to specific time in video
        function seekTo(targetTime) {
            if (!videoElement) return;
            videoElement.currentTime = Math.max(0, Math.min(targetTime, videoElement.duration));
            updateProgress();
        }

        // Show controls and auto-hide after 4 seconds
        function showControls() {
            ui.classList.remove('hidden');
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => ui.classList.add('hidden'), 4000);
        }

        // Show controls on mouse movement or touch
        document.addEventListener('mousemove', showControls);
        document.addEventListener('touchstart', showControls);

        // Seek bar click to jump to position
        seekContainer.addEventListener('click', (e) => {
            if (!videoElement || !videoElement.duration) return;
            
            const rect = seekContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * videoElement.duration;
            seekTo(newTime);
        });

        // Seek bar drag functionality
        let dragging = false;
        seekContainer.addEventListener('mousedown', () => dragging = true);
        document.addEventListener('mouseup', () => dragging = false);
        
        seekContainer.addEventListener('mousemove', (e) => {
            if (!dragging || !videoElement?.duration) return;
            
            const rect = seekContainer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
            seekTo(ratio * videoElement.duration);
        });

        // Play/Pause button
        playPauseBtn.onclick = () => {
            if (!videoElement) return;
            
            if (videoElement.paused) { 
                videoElement.play(); 
                playIcon.textContent = 'pause'; 
            } else { 
                videoElement.pause(); 
                playIcon.textContent = 'play_arrow'; 
            }
            showControls();
        };

        // Skip backward 10 seconds
        skipBackBtn.onclick = () => {
            const currentTime = videoElement?.currentTime || 0;
            seekTo(currentTime - 10);
        };
        
        // Skip forward 10 seconds
        skipFwdBtn.onclick = () => {
            const currentTime = videoElement?.currentTime || 0;
            seekTo(currentTime + 10);
        };

        // Mute/unmute toggle
        muteBtn.onclick = () => {
            if (!videoElement) return;
            
            muted = !muted;
            videoElement.muted = muted;
            
            // Update icon based on mute state
            muteIcon.textContent = muted ? 'volume_off' : (videoElement.volume > 0.5 ? 'volume_up' : 'volume_down');
        };

        // Volume slider input handler
        volumeSlider.oninput = () => {
            if (!videoElement) return;
            
            videoElement.volume = volumeSlider.value;
            
            // Update volume icon based on level
            if (volumeSlider.value == 0) {
                muteIcon.textContent = 'volume_off';
            } else if (volumeSlider.value < 0.5) {
                muteIcon.textContent = 'volume_down';
            } else {
                muteIcon.textContent = 'volume_up';
            }
        };

        // Fullscreen toggle
        fullscreenBtn.onclick = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
                fsIcon.textContent = 'fullscreen_exit';
            } else {
                document.exitFullscreen();
                fsIcon.textContent = 'fullscreen';
            }
        };

        // ── Settings panel logic ──
        const settingsBtn   = document.getElementById('settingsBtn');
        const settingsPanel = document.getElementById('settingsPanel');
        const speedPanel    = document.getElementById('speedPanel');
        const repeatPanel   = document.getElementById('repeatPanel');
        const qualityPanel  = document.getElementById('qualityPanel');
        const speedLabel    = document.getElementById('speedLabel');
        const repeatLabel   = document.getElementById('repeatLabel');
        const qualityLabel  = document.getElementById('qualityLabel');

        // Close all settings panels
        function closeAll() {
            settingsPanel.classList.remove('open');
            speedPanel.classList.remove('open');
            repeatPanel.classList.remove('open');
            qualityPanel.classList.remove('open');
        }

        // Settings button click handler
        settingsBtn.onclick = (e) => {
            e.stopPropagation();
            const isOpen = settingsPanel.classList.contains('open');
            closeAll();
            if (!isOpen) settingsPanel.classList.add('open');
            showControls();
        };

        // Open speed sub-panel
        document.getElementById('setSpeed').onclick = (e) => {
            e.stopPropagation();
            settingsPanel.classList.remove('open');
            speedPanel.classList.add('open');
        };

        // Open repeat sub-panel
        document.getElementById('setRepeat').onclick = (e) => {
            e.stopPropagation();
            settingsPanel.classList.remove('open');
            repeatPanel.classList.add('open');
        };

        // Open quality sub-panel
        document.getElementById('setQuality').onclick = (e) => {
            e.stopPropagation();
            settingsPanel.classList.remove('open');
            qualityPanel.classList.add('open');
        };

        // Back button in speed panel
        document.getElementById('speedBack').onclick = (e) => {
            e.stopPropagation();
            speedPanel.classList.remove('open');
            settingsPanel.classList.add('open');
        };

        // Back button in repeat panel
        document.getElementById('repeatBack').onclick = (e) => {
            e.stopPropagation();
            repeatPanel.classList.remove('open');
            settingsPanel.classList.add('open');
        };

        // Back button in quality panel
        document.getElementById('qualityBack').onclick = (e) => {
            e.stopPropagation();
            qualityPanel.classList.remove('open');
            settingsPanel.classList.add('open');
        };

        // Speed option selection
        document.querySelectorAll('[data-speed]').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const speed = parseFloat(opt.dataset.speed);
                if (videoElement) videoElement.playbackRate = speed;
                
                speedLabel.textContent = speed + 'x';
                
                // Mark this option as active
                document.querySelectorAll('[data-speed]').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                
                updateEndsAt();
                closeAll();
                settingsPanel.classList.add('open');
            });
        });

        // Repeat mode selection
        document.querySelectorAll('[data-repeat]').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const mode = opt.dataset.repeat;
                if (videoElement) videoElement.loop = (mode === 'one');
                
                repeatLabel.textContent = opt.querySelector('.opt-label').textContent;
                
                // Mark active
                document.querySelectorAll('[data-repeat]').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                
                closeAll();
                settingsPanel.classList.add('open');
            });
        });

        // Quality/bitrate selection
        document.querySelectorAll('[data-bitrate]').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const bitrate = parseInt(opt.dataset.bitrate);
                const label = opt.querySelector('.opt-label').textContent;
                
                qualityLabel.textContent = label;
                
                // Mark active
                document.querySelectorAll('[data-bitrate]').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                
                // Change video source with new bitrate parameter
                if (videoElement && videoElement.src) {
                    const currentTime = videoElement.currentTime;
                    const url = new URL(videoElement.src);
                    
                    if (bitrate === 0) {
                        url.searchParams.delete('maxStreamingBitrate');
                    } else {
                        url.searchParams.set('maxStreamingBitrate', bitrate);
                    }
                    
                    videoElement.src = url.toString();
                    videoElement.currentTime = currentTime;
                    videoElement.play().catch(() => {});
                }
                
                closeAll();
                settingsPanel.classList.add('open');
            });
        });

        // Click outside to close settings
        document.addEventListener('click', () => closeAll());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!videoElement) return;
            
            // Space = play/pause
            if (e.key === ' ') { 
                e.preventDefault(); 
                playPauseBtn.click(); 
            }
            
            // Arrow right = skip forward 5s
            if (e.key === 'ArrowRight') { 
                e.preventDefault(); 
                seekTo(videoElement.currentTime + 5); 
            }
            
            // Arrow left = skip back 5s
            if (e.key === 'ArrowLeft') { 
                e.preventDefault(); 
                seekTo(videoElement.currentTime - 5); 
            }
            
            // M = mute toggle
            if (e.key === 'm' || e.key === 'M') {
                muteBtn.click();
            }
            
            // F = fullscreen toggle
            if (e.key === 'f' || e.key === 'F') {
                fullscreenBtn.click();
            }
            
            showControls();
        });

        // Listen for video load message from parent
        window.addEventListener('message', (e) => {
            const { type, src, currentTime } = e.data || {};
            if (type !== 'LOAD_VIDEO' || !src) return;

            // Create video element
            videoElement = document.createElement('video');
            videoElement.id          = 'my360video';
            videoElement.src         = src;
            videoElement.crossOrigin = 'anonymous';
            videoElement.autoplay    = true;
            videoElement.loop        = false;
            videoElement.playsInline = true;
            videoElement.volume      = parseFloat(volumeSlider.value);

            // a-frame assets
            document.getElementById('assets').appendChild(videoElement);

            // Attach video to 360 sphere
            videosphere.setAttribute('material', {
                shader: 'flat', 
                side: 'back',
                src: '#my360video', 
                repeat: '-1 1'
            });

            // Set up event listeners
            videoElement.addEventListener('timeupdate', updateProgress);
            videoElement.addEventListener('durationchange', updateEndsAt);

            videoElement.onloadedmetadata = () => {
                if (currentTime) videoElement.currentTime = currentTime;
                playIcon.textContent = 'pause';
                updateEndsAt();
                showControls();
            };

            videoElement.play().catch(() => {});
        });

        // Remove A-Frame's default VR button (we don't want it)
        const aframeRemove = new MutationObserver(() => {
            document.querySelectorAll('.a-enter-vr, .a-enter-ar').forEach(el => el.remove());
        });
        aframeRemove.observe(document.body, { childList: true, subtree: true });
        document.querySelectorAll('.a-enter-vr, .a-enter-ar').forEach(el => el.remove());
    <\/script>
<\/body>
<\/html>`;

  // Get current Jellyfin video source and timestamp
  function getJellyfinStamp() {
    const vid = document.querySelector('video');
    if (!vid || !vid.src) return null;
    return { src: vid.src, currentTime: vid.currentTime };
  }

  // Open the 360 VR player overlay
  function opentheplayer() {
    // Don't open if already open
    if (document.getElementById('vr360-overlay')) return;

    const videoInfo = getJellyfinStamp();
    if (!videoInfo) {
      alert('No video playing — start a video in Jellyfin first.');
      return;
    }

    // Pause Jellyfin's native player
    const jellyfinVideo = document.querySelector('video');
    if (jellyfinVideo) jellyfinVideo.pause();

    // Create blob URL for player HTML
    const blob    = new Blob([PLAYER_HTML], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'vr360-overlay';
    overlay.style.cssText = `position:fixed;inset:0;z-index:99999;background:#000;`;

    // Back button to exit VR mode
    const backBtn = document.createElement('button');
    backBtn.style.cssText = `
      position:absolute;top:12px;left:12px;z-index:100000;
      background:transparent;border:none;color:rgba(255,255,255,0.87);
      cursor:pointer;display:flex;align-items:center;gap:4px;
      font-family:'Noto Sans',sans-serif;font-size:15px;font-weight:600;
      padding:8px;border-radius:50%;transition:background 0.2s;
    `;
    backBtn.innerHTML = '<span style="font-family:\'Material Icons\',sans-serif;font-size:26px;line-height:1;">arrow_back</span>';
    
    // Button hover effects
    backBtn.onmouseenter = () => backBtn.style.background = 'rgba(255,255,255,0.1)';
    backBtn.onmouseleave = () => backBtn.style.background = 'transparent';
    
    // Close VR player on click
    backBtn.onclick = () => {
      URL.revokeObjectURL(blobUrl);
      overlay.remove();
      if (jellyfinVideo) jellyfinVideo.play();
    };

    // Create iframe for VR player
    const iframe = document.createElement('iframe');
    iframe.src = blobUrl;
    iframe.style.cssText = `position:absolute;inset:0;border:none;width:100%;height:100%;`;
    iframe.allow = 'autoplay; fullscreen; xr-spatial-tracking';
    
    // Send video data to iframe once loaded
    iframe.onload = () => {
      iframe.contentWindow.postMessage({
        type: 'LOAD_VIDEO',
        src: videoInfo.src,
        currentTime: videoInfo.currentTime
      }, '*');
    };

    overlay.appendChild(backBtn);
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);

    // ESC key to exit VR mode
    const onKey = (e) => {
      if (e.key === 'Escape') {
        URL.revokeObjectURL(blobUrl);
        overlay.remove();
        if (jellyfinVideo) jellyfinVideo.play();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);
  }

  // Create the "VR" button in Jellyfin UI
  function createVRstuff() {
    // Don't create duplicate buttons
    if (document.getElementById('vr360-toggleplay')) return;

    const fullscreenBtn = document.querySelector('.btnFullscreen');
    if (!fullscreenBtn) return;

    const btn = document.createElement('button');
    btn.id = 'vr360-toggleplay';
    btn.setAttribute('is', 'paper-icon-button-light');
    btn.className = 'autoSize paper-icon-button-light';
    btn.title = 'VR Player';
    btn.setAttribute('aria-label', 'VR Player');

    const span = document.createElement('span');
    span.className = 'largePaperIconButton';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = 'VR';
    span.style.cssText = `
      font-family: 'Noto Sans', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    `;

    btn.appendChild(span);
    btn.onclick = opentheplayer;
    
    // Insert button before fullscreen button
    fullscreenBtn.parentNode.insertBefore(btn, fullscreenBtn);
  }

  // Remove VR button from UI
  function removeVRstuff() {
    const el = document.getElementById('vr360-toggleplay');
    if (el) el.remove();
  }

  // Check if video is playing and show/hide VR button accordingly
  function checkForVideo() {
    const vid = document.querySelector('video');
    const hasVideo = vid && vid.src;
    
    if (hasVideo) {
      if (!document.getElementById('vr360-toggleplay')) createVRstuff();
    } else {
      removeVRstuff();
    }
  }

  // Watch DOM for video element changes
  const observer = new MutationObserver(checkForVideo);

  // Initialize everything
  function init() {
    checkForVideo();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Run init when page loads
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();