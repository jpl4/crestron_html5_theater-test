// Wait until the webpage structure (DOM) is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- Get References to Important Elements ---
    const timeDisplay = document.getElementById('time-display');
    const pages = document.querySelectorAll('.page');
    const sourceButtons = document.querySelectorAll('.source-button');
    const backButtons = document.querySelectorAll('.back-button');
    const powerButton = document.getElementById('power-button');
    const powerPopup = document.getElementById('power-popup');
    const powerConfirmYes = document.getElementById('power-confirm-yes');
    const powerConfirmNo = document.getElementById('power-confirm-no');
    const volumeLevelDisplay = document.getElementById('volume-level');
    const muteButton = document.getElementById('mute-button');
    const volUpButton = document.querySelector('.vol-up');
    const volDownButton = document.querySelector('.vol-down');

    const navLightingButton = document.getElementById('nav-lighting-button');
    const navMaskingButton = document.getElementById('nav-masking-button');

    // Lighting Page Refs
    const downlightsSlider = document.getElementById('downlights-slider');
    const sconcesSlider = document.getElementById('sconces-slider');
    const stepsSlider = document.getElementById('steps-slider');
    const downlightsPercentage = document.getElementById('downlights-percentage');
    const sconcesPercentage = document.getElementById('sconces-percentage');
    const stepsPercentage = document.getElementById('steps-percentage');
    const lightingPresetButtons = document.querySelectorAll('.preset-button');

    // Masking Page Refs
    const maskingButtons = document.querySelectorAll('.masking-button');

    // --- State Variables ---
    let currentVolumeDb = -45.0; // Example starting volume
    let isMuted = false; // Example mute state
    let volIntervalTimer = null; // Timer for volume ramping
    let activeLightingPreset = null; // Track active lighting preset
    let activeMaskingPreset = null; // Track active masking preset

    // --- Functions ---

    // Function to update the time display
    function updateTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hoursStr = hours.toString().padStart(2, ' ');
        if (timeDisplay) {
            timeDisplay.textContent = `${hoursStr}:${minutes} ${ampm}`;
        }
    }

    // Function to update the volume display
    function updateVolumeDisplay(dbValue) {
         if (volumeLevelDisplay) {
            volumeLevelDisplay.textContent = `${dbValue.toFixed(1)} dB`;
        }
    }

     // Function to update mute button visual state
     function updateMuteButtonState(muted) {
        if (!muteButton) return;
        isMuted = muted; // Ensure state variable is updated
        if (muted) {
            muteButton.classList.add('active');
            muteButton.innerHTML = '<i class="fas fa-volume-off"></i>';
        } else {
            muteButton.classList.remove('active');
            muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
     }

    // Function to show a specific page and hide others
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });

        // Show power button ONLY on Source pages
        const isSourcePage = ['appletv-page', 'bluray-page', 'cinema-page'].includes(pageId);
        if (powerButton) {
            powerButton.style.display = isSourcePage ? 'inline-flex' : 'none';
        }

        // Add active state to bottom nav buttons
        navLightingButton?.classList.toggle('active', pageId === 'lighting-page');
        navMaskingButton?.classList.toggle('active', pageId === 'masking-page');

        console.log(`Navigated to page: ${pageId}`);
    }

    // Function to show the power off popup
    function showPowerPopup() {
        if (powerPopup) {
            powerPopup.classList.add('show');
            console.log("Power popup shown");
        }
    }

    // Function to hide the power off popup
    function hidePowerPopup() {
        if (powerPopup) {
            powerPopup.classList.remove('show');
            console.log("Power popup hidden");
        }
    }

    // --- Event Listeners ---

    // Source button clicks
    sourceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPageId = button.getAttribute('data-page');
            if(targetPageId) {
                showPage(targetPageId);
                // --- CRESTRON INTEGRATION POINT ---
                console.log(`Source selected: ${targetPageId}`);
                // Example: CrComLib.publishEvent('n', '1', sourceNumericId);
            }
        });
    });

     // Back button clicks (navigate back to home)
     backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPageId = button.getAttribute('data-page'); // Should be 'home-page'
             if (targetPageId) {
                showPage(targetPageId);
             }
             console.log("Back button pressed");
        });
    });

    // Power button click
    powerButton?.addEventListener('click', showPowerPopup);

    // Power confirmation clicks
    powerConfirmYes?.addEventListener('click', () => {
        hidePowerPopup();
        // --- CRESTRON INTEGRATION POINT ---
        console.log("Shutdown Confirmed!");
        // Example: CrComLib.publishEvent('b', '10', true); CrComLib.publishEvent('b', '10', false);
        showPage('home-page'); // Navigate home after confirm
    });

    powerConfirmNo?.addEventListener('click', hidePowerPopup);

    // Mute button click
    muteButton?.addEventListener('click', () => {
        const newState = !isMuted; // Calculate new state first
        updateMuteButtonState(newState); // Update UI and internal state
         // --- CRESTRON INTEGRATION POINT ---
         console.log(`Mute toggled: ${newState}`);
         // Send the *new* state to Crestron
         // Example: CrComLib.publishEvent('b', '11', newState); // Assuming Mute Set join is 11
         // Or if using a toggle join:
         // CrComLib.publishEvent('b', '12', true); CrComLib.publishEvent('b', '12', false); // Assuming Toggle join 12
    });

    // Volume Up/Down Hold Logic
    function handleVolumeChange(direction) {
        console.log(`Volume ${direction} PRESSED`);
        // --- CRESTRON INTEGRATION POINT ---
        // Send initial press (digital join press/release)
        // Example for Vol Up on djoin 13, Vol Down on djoin 14
        // const join = direction === 'Up' ? '13' : '14';
        // CrComLib.publishEvent('b', join, true);
        // CrComLib.publishEvent('b', join, false);

        // Clear any existing timer
        if (volIntervalTimer) clearInterval(volIntervalTimer);

        // Start ramping timer
        volIntervalTimer = setInterval(() => {
             console.log(`Volume ${direction} HELD`);
            // --- CRESTRON INTEGRATION POINT ---
            // Send subsequent presses for hold/ramp
            // CrComLib.publishEvent('b', join, true);
            // CrComLib.publishEvent('b', join, false);
        }, 200); // Adjust ramp speed (milliseconds)
    }

    function stopVolumeChange(direction) {
        console.log(`Volume ${direction} RELEASED`);
        if (volIntervalTimer) {
            clearInterval(volIntervalTimer);
            volIntervalTimer = null;
        }
    }

    // Add listeners for touch and mouse events for volume buttons
    ['mousedown', 'touchstart'].forEach(eventType => {
        volUpButton?.addEventListener(eventType, (e) => { e.preventDefault(); handleVolumeChange('Up'); });
        volDownButton?.addEventListener(eventType, (e) => { e.preventDefault(); handleVolumeChange('Down'); });
    });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(eventType => {
        volUpButton?.addEventListener(eventType, (e) => { e.preventDefault(); stopVolumeChange('Up'); });
        volDownButton?.addEventListener(eventType, (e) => { e.preventDefault(); stopVolumeChange('Down'); });
    });

    // --- Bottom Bar Navigation Button Listeners ---
    navLightingButton?.addEventListener('click', () => showPage('lighting-page'));
    navMaskingButton?.addEventListener('click', () => showPage('masking-page'));

    // --- Lighting Page Listeners ---
    function handleSliderInput(sliderElement, percentageElement) {
        if (!sliderElement || !percentageElement) return;
        const value = sliderElement.value;
        percentageElement.textContent = `${value}%`;

        // --- CRESTRON INTEGRATION POINT ---
        const sliderId = sliderElement.id;
        console.log(`Slider ${sliderId} changed to ${value}%`);
        // Example: Convert value (0-100) to Crestron analog (0-65535)
        // const analogValue = Math.round((value / 100) * 65535);
        // let joinNumber;
        // if (sliderId === 'downlights-slider') joinNumber = '201'; // Assign analog joins
        // else if (sliderId === 'sconces-slider') joinNumber = '202';
        // else if (sliderId === 'steps-slider') joinNumber = '203';
        // if(joinNumber) CrComLib.publishEvent('n', joinNumber, analogValue);

        // Deactivate any active preset button when a slider is manually moved
        lightingPresetButtons.forEach(btn => btn.classList.remove('active'));
        activeLightingPreset = null;
    }

    // Add listeners to sliders ('input' fires continuously)
    downlightsSlider?.addEventListener('input', () => handleSliderInput(downlightsSlider, downlightsPercentage));
    sconcesSlider?.addEventListener('input', () => handleSliderInput(sconcesSlider, sconcesPercentage));
    stepsSlider?.addEventListener('input', () => handleSliderInput(stepsSlider, stepsPercentage));
    // Optional: Use 'change' event to fire only when released

    // Add listeners to preset buttons
    lightingPresetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const presetId = button.id;

            // Only send command if it's not already active (optional, prevents resending)
            if (activeLightingPreset !== presetId) {
                activeLightingPreset = presetId; // Store which preset is active

                // Update visual state
                lightingPresetButtons.forEach(btn => btn.classList.toggle('active', btn.id === presetId));

                // --- CRESTRON INTEGRATION POINT ---
                console.log(`Lighting Preset ${presetId} selected`);
                // Example: Send digital join press for the preset
                // let joinNumber;
                // if (presetId === 'preset-high') joinNumber = '211'; // Assign digital joins
                // else if (presetId === 'preset-preview') joinNumber = '212';
                // else if (presetId === 'preset-movie') joinNumber = '213';
                // else if (presetId === 'preset-off') joinNumber = '214';
                // if(joinNumber) { CrComLib.publishEvent('b', joinNumber, true); CrComLib.publishEvent('b', joinNumber, false); }
            }
        });
    });

    // --- Masking Page Listeners ---
    maskingButtons.forEach(button => {
        button.addEventListener('click', () => {
            const maskId = button.id;

            // Only send command if it's not already active
             if (activeMaskingPreset !== maskId) {
                activeMaskingPreset = maskId;

                // Toggle active state visually
                maskingButtons.forEach(btn => btn.classList.toggle('active', btn.id === maskId));

                // --- CRESTRON INTEGRATION POINT ---
                console.log(`Masking Preset ${maskId} selected`);
                // Example: Send digital join press
                // let joinNumber;
                // if (maskId === 'masking-scope') joinNumber = '221'; // Assign digital joins
                // else if (maskId === 'masking-flat') joinNumber = '222';
                // if(joinNumber) { CrComLib.publishEvent('b', joinNumber, true); CrComLib.publishEvent('b', joinNumber, false); }
            }
        });
    });

    // --- Apple TV Control Button Listeners ---
    document.getElementById('atv-menu')?.addEventListener('click', () => console.log('ATV Menu Pressed'));
    document.getElementById('atv-tv-home')?.addEventListener('click', () => console.log('ATV TV/Home Pressed'));
    document.getElementById('atv-back')?.addEventListener('click', () => console.log('ATV Back Pressed'));
    document.getElementById('atv-up')?.addEventListener('click', () => console.log('ATV Up Pressed'));
    document.getElementById('atv-left')?.addEventListener('click', () => console.log('ATV Left Pressed'));
    document.getElementById('atv-select')?.addEventListener('click', () => console.log('ATV Select Pressed'));
    document.getElementById('atv-right')?.addEventListener('click', () => console.log('ATV Right Pressed'));
    document.getElementById('atv-down')?.addEventListener('click', () => console.log('ATV Down Pressed'));
    document.getElementById('atv-playpause')?.addEventListener('click', () => console.log('ATV Play/Pause Pressed'));
    document.getElementById('atv-mic')?.addEventListener('click', () => console.log('ATV Mic Pressed'));

    // --- Blu-ray Control Button Listeners ---
    document.getElementById('bd-top-menu')?.addEventListener('click', () => console.log('BD Top Menu Pressed'));
    document.getElementById('bd-popup-menu')?.addEventListener('click', () => console.log('BD Popup Menu Pressed'));
    document.getElementById('bd-back')?.addEventListener('click', () => console.log('BD Back Pressed'));
    document.getElementById('bd-eject')?.addEventListener('click', () => console.log('BD Eject Pressed'));
    document.getElementById('bd-up')?.addEventListener('click', () => console.log('BD Up Pressed'));
    document.getElementById('bd-left')?.addEventListener('click', () => console.log('BD Left Pressed'));
    document.getElementById('bd-enter')?.addEventListener('click', () => console.log('BD Enter Pressed'));
    document.getElementById('bd-right')?.addEventListener('click', () => console.log('BD Right Pressed'));
    document.getElementById('bd-down')?.addEventListener('click', () => console.log('BD Down Pressed'));
    document.getElementById('bd-skip-rev')?.addEventListener('click', () => console.log('BD Skip Rev Pressed'));
    document.getElementById('bd-rewind')?.addEventListener('click', () => console.log('BD Rewind Pressed'));
    document.getElementById('bd-play')?.addEventListener('click', () => console.log('BD Play Pressed'));
    document.getElementById('bd-pause')?.addEventListener('click', () => console.log('BD Pause Pressed'));
    document.getElementById('bd-stop')?.addEventListener('click', () => console.log('BD Stop Pressed'));
    document.getElementById('bd-forward')?.addEventListener('click', () => console.log('BD Forward Pressed'));
    document.getElementById('bd-skip-fwd')?.addEventListener('click', () => console.log('BD Skip Fwd Pressed'));
    document.getElementById('bd-info')?.addEventListener('click', () => console.log('BD Info Pressed'));
    document.getElementById('bd-audio')?.addEventListener('click', () => console.log('BD Audio Pressed'));
    document.getElementById('bd-subtitle')?.addEventListener('click', () => console.log('BD Subtitle Pressed'));

    // --- Initialization ---
    updateTime(); // Update time immediately
    const timeInterval = setInterval(updateTime, 1000); // Update time every second

    updateVolumeDisplay(currentVolumeDb); // Set initial volume display
    updateMuteButtonState(isMuted); // Set initial mute button state

    // Initialize slider percentages on load
    handleSliderInput(downlightsSlider, downlightsPercentage);
    handleSliderInput(sconcesSlider, sconcesPercentage);
    handleSliderInput(stepsSlider, stepsPercentage);

    showPage('home-page'); // Ensure home page is shown first

    // --- CRESTRON INTEGRATION POINT (Feedback Examples) ---
    // Add feedback subscriptions for volume, mute, lighting levels/presets, and masking state
    // window.CrComLib = window.CrComLib || {}; // Ensure CrComLib exists if using standalone testing
    // CrComLib.subscribeState('n', '101', (value) => { // Volume dB Feedback (e.g., analog join 101)
    //      const minDb = -80.0; const maxDb = 0.0;
    //      currentVolumeDb = minDb + ((value / 65535) * (maxDb - minDb)); // Example scaling
    //      updateVolumeDisplay(currentVolumeDb);
    // });
    // CrComLib.subscribeState('b', '102', (value) => { // Mute Status Feedback (e.g., digital join 102)
    //      updateMuteButtonState(value); // Update UI based on feedback
    // });
    // // Light Level Feedback:
    // CrComLib.subscribeState('n', '301', (value) => { // Downlights Level FB (AJ 301)
    //    const percent = Math.round((value / 65535) * 100);
    //    if (downlightsSlider) downlightsSlider.value = percent;
    //    if (downlightsPercentage) downlightsPercentage.textContent = `${percent}%`;
    // }); // Add similar for Sconces (AJ 302), Steps (AJ 303)
    // // Lighting Preset Feedback:
    // CrComLib.subscribeState('b', '311', (value) => { // High Preset FB (DJ 311)
    //     if(value) { lightingPresetButtons.forEach(btn => btn.classList.toggle('active', btn.id === 'preset-high')); activeLightingPreset = 'preset-high'; }
    // }); // Add similar for Preview (DJ 312), Movie (DJ 313), Off (DJ 314)
    // // Masking State Feedback:
    // CrComLib.subscribeState('b', '321', (value) => { // Scope Active FB (DJ 321)
    //     if(value) { maskingButtons.forEach(btn => btn.classList.toggle('active', btn.id === 'masking-scope')); activeMaskingPreset = 'masking-scope'; }
    // });
    // CrComLib.subscribeState('b', '322', (value) => { // Flat Active FB (DJ 322)
    //      if(value) { maskingButtons.forEach(btn => btn.classList.toggle('active', btn.id === 'masking-flat')); activeMaskingPreset = 'masking-flat'; }
    // });


    // Cleanup interval on window unload
    window.addEventListener('beforeunload', () => {
        clearInterval(timeInterval);
        if (volIntervalTimer) {
             clearInterval(volIntervalTimer);
        }
    });

}); // End DOMContentLoaded