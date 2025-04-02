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
    const powerPopupClose = document.getElementById('power-popup-close');
    const lightingPopup = document.getElementById('lighting-popup');
    const lightingPopupClose = document.getElementById('lighting-popup-close');
    const maskingPopup = document.getElementById('masking-popup');
    const maskingPopupClose = document.getElementById('masking-popup-close');
    const navLightingButton = document.getElementById('nav-lighting-button');
    const navMaskingButton = document.getElementById('nav-masking-button');
    const volumeLevelDisplay = document.getElementById('volume-level');
    const muteButton = document.getElementById('mute-button');
    const volUpButton = document.querySelector('.vol-up');
    const volDownButton = document.querySelector('.vol-down');
    const downlightsSlider = document.getElementById('downlights-slider');
    const sconcesSlider = document.getElementById('sconces-slider');
    const stepsSlider = document.getElementById('steps-slider');
    const downlightsPercentage = document.getElementById('downlights-percentage');
    const sconcesPercentage = document.getElementById('sconces-percentage');
    const stepsPercentage = document.getElementById('steps-percentage');
    const lightingPresetButtons = document.querySelectorAll('.preset-button');
    const maskingButtons = document.querySelectorAll('.masking-button');

    // --- State Variables ---
    let currentVolumeDb = -45.0;
    let isMuted = false;
    let volIntervalTimer = null;
    let activeLightingPreset = null;
    let activeMaskingPreset = null;
    let activePopup = null;
    let timeInterval = null; // Reference for the time interval

    // --- Functions ---

    // Update time display
    function updateTime() {
        try {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const hoursStr = hours.toString().padStart(2, ' ');
            if (timeDisplay) {
                timeDisplay.textContent = `${hoursStr}:${minutes} ${ampm}`;
            } else {
                // console.warn("Time display element not found"); // Less critical warning
            }
        } catch (error) {
            console.error("Error updating time:", error);
            if (timeInterval) clearInterval(timeInterval); // Stop interval if it errors
        }
    }

    // Update volume display
    function updateVolumeDisplay(dbValue) {
        if (volumeLevelDisplay) volumeLevelDisplay.textContent = `${dbValue.toFixed(1)} dB`;
    }

    // Update mute button visual state
    function updateMuteButtonState(muted) {
        if (!muteButton) return;
        isMuted = muted;
        muteButton.classList.toggle('active', muted);
        muteButton.innerHTML = muted ? '<i class="fas fa-volume-off"></i>' : '<i class="fas fa-volume-mute"></i>';
    }

    // Show Page (Only for actual page navigation)
    function showPage(pageId) {
        hidePopup(true); // Ensure popups hidden

        let foundPage = false;
        pages.forEach(page => {
            const isActive = page.id === pageId;
            page.classList.toggle('active', isActive);
            if (isActive) foundPage = true;
        });

        if (!foundPage) {
            console.error(`Page with ID "${pageId}" not found.`);
            return; // Don't continue if page doesn't exist
        }

        const isSourcePage = ['appletv-page', 'bluray-page', 'cinema-page'].includes(pageId);
        if (powerButton) {
            powerButton.style.display = isSourcePage ? 'inline-flex' : 'none';
        }
        console.log(`Navigated to page: ${pageId}`);
    }

    // Show Popup Function
    function showPopup(popupElement) {
        if (!popupElement) {
             console.error("Attempted to show an invalid popup element.");
             return;
        }
        hidePopup(true); // Hide any currently open popup first

        popupElement.classList.add('show');
        activePopup = popupElement;

        navLightingButton?.classList.toggle('active', popupElement.id === 'lighting-popup');
        navMaskingButton?.classList.toggle('active', popupElement.id === 'masking-popup');

        console.log(`Popup shown: ${popupElement.id}`);
    }

    // Hide Popup Function
    function hidePopup(calledInternally = false) {
        if (activePopup) {
            activePopup.classList.remove('show');
            if (!calledInternally) {
                 console.log(`Popup hidden: ${activePopup.id}`);
            }
            activePopup = null;
             navLightingButton?.classList.remove('active');
             navMaskingButton?.classList.remove('active');
        }
    }

    // Handle Slider Input (updates value, percentage, and CSS variable)
    function handleSliderInput(sliderElement) {
        if (!sliderElement) return;
        const sliderGroup = sliderElement.closest('.slider-group'); // Find parent group
        const percentageElement = sliderGroup?.querySelector('.slider-percentage'); // Find percentage span within group
        if (!percentageElement) return;

        const value = sliderElement.value;
        percentageElement.textContent = `${value}%`;
        sliderElement.style.setProperty('--value-percent', `${value}%`);

        // --- CRESTRON INTEGRATION POINT ---
        const sliderId = sliderElement.id;
        console.log(`Slider ${sliderId} changed to ${value}%`);
        // CrComLib Action...

        // Deactivate any active preset button
        lightingPresetButtons?.forEach(btn => btn.classList.remove('active'));
        activeLightingPreset = null;
    }


    // --- Event Listeners ---

    // Source button clicks -> Use showPage
    sourceButtons?.forEach(button => {
        button.addEventListener('click', () => {
            const targetPageId = button.getAttribute('data-page');
            if(targetPageId) showPage(targetPageId);
            else console.error("Source button missing data-page attribute:", button);
        });
    });

    // Back button clicks -> Use showPage (always to home)
    backButtons?.forEach(button => {
        button.addEventListener('click', () => {
            const targetPageId = button.getAttribute('data-page'); // Should be home-page
            if (targetPageId) showPage(targetPageId);
            else console.error("Back button missing data-page attribute:", button);
        });
    });

    // Power button click -> Show Power Popup
    powerButton?.addEventListener('click', () => showPopup(powerPopup));

    // Power confirmation clicks
    powerConfirmYes?.addEventListener('click', () => { hidePopup(); console.log("Shutdown Confirmed!"); /* CrComLib Action...*/ showPage('home-page'); });
    powerConfirmNo?.addEventListener('click', hidePopup);

    // --- Popup Close Button Listeners ---
    powerPopupClose?.addEventListener('click', hidePopup);
    lightingPopupClose?.addEventListener('click', hidePopup);
    maskingPopupClose?.addEventListener('click', hidePopup);

    // Mute button click
    muteButton?.addEventListener('click', () => { const newState = !isMuted; updateMuteButtonState(newState); console.log(`Mute toggled: ${newState}`); /* CrComLib Action...*/ });

    // Volume Up/Down Hold Logic
    function handleVolumeChange(direction) { console.log(`Volume ${direction} PRESSED`); /* CrComLib Action...*/ if (volIntervalTimer) clearInterval(volIntervalTimer); volIntervalTimer = setInterval(()=>{console.log(`Volume ${direction} HELD`); /* CrComLib Action...*/ }, 200); }
    function stopVolumeChange(direction) { console.log(`Volume ${direction} RELEASED`); if (volIntervalTimer) { clearInterval(volIntervalTimer); volIntervalTimer = null; } }
    ['mousedown', 'touchstart'].forEach(eventType => { volUpButton?.addEventListener(eventType, (e) => { e.preventDefault(); handleVolumeChange('Up'); }); volDownButton?.addEventListener(eventType, (e) => { e.preventDefault(); handleVolumeChange('Down'); }); });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(eventType => { volUpButton?.addEventListener(eventType, (e) => { e.preventDefault(); stopVolumeChange('Up'); }); volDownButton?.addEventListener(eventType, (e) => { e.preventDefault(); stopVolumeChange('Down'); }); });

    // --- Bottom Bar Navigation Button Listeners -> Use showPopup ---
    navLightingButton?.addEventListener('click', () => showPopup(lightingPopup));
    navMaskingButton?.addEventListener('click', () => showPopup(maskingPopup));

    // --- Lighting Popup Listeners ---
    [downlightsSlider, sconcesSlider, stepsSlider].forEach(slider => {
        if (slider) {
            handleSliderInput(slider); // Initialize display and gradient
            slider.addEventListener('input', () => handleSliderInput(slider));
        }
    });
    lightingPresetButtons?.forEach(button => { button.addEventListener('click', () => { const presetId = button.id; if (activeLightingPreset !== presetId) { activeLightingPreset = presetId; lightingPresetButtons.forEach(btn => btn.classList.toggle('active', btn.id === presetId)); console.log(`Lighting Preset ${presetId} selected`); /* CrComLib Action...*/ } }); });

    // --- Masking Popup Listeners ---
    maskingButtons?.forEach(button => { button.addEventListener('click', () => { const maskId = button.id; if (activeMaskingPreset !== maskId) { activeMaskingPreset = maskId; maskingButtons.forEach(btn => btn.classList.toggle('active', btn.id === maskId)); console.log(`Masking Preset ${maskId} selected`); /* CrComLib Action...*/ } }); });

    // --- *** FULLY ADDED Apple TV / Blu-ray Control Button Listeners *** ---
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
    console.log("Initializing UI..."); // Add log
    try {
        updateTime(); // Update time immediately
        timeInterval = setInterval(updateTime, 1000); // Store interval ID

        updateVolumeDisplay(currentVolumeDb);
        updateMuteButtonState(isMuted);

        // Sliders are initialized in their event listener setup loop above

        showPage('home-page'); // Ensure home page is shown first
        console.log("UI Initialized Successfully.");
    } catch (error) {
         console.error("Error during UI Initialization:", error);
         // Display error to user if needed
    }

    // --- CRESTRON Feedback Examples ---
    /* ... (Same examples) ... */

    // Cleanup interval
    window.addEventListener('beforeunload', () => {
        if (timeInterval) clearInterval(timeInterval);
        if (volIntervalTimer) clearInterval(volIntervalTimer);
    });

}); // End DOMContentLoaded