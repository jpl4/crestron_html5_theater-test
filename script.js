// Wait until the webpage structure (DOM) is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- Get References (Same as before) ---
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

    // --- State Variables (Same as before) ---
    let currentVolumeDb = -45.0;
    let isMuted = false;
    let volIntervalTimer = null;
    let activeLightingPreset = null;
    let activeMaskingPreset = null;
    let activePopup = null;

    // --- Functions ---

    // Update time display
    function updateTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hoursStr = hours.toString().padStart(2, ' ');
        if (timeDisplay) timeDisplay.textContent = `${hoursStr}:${minutes} ${ampm}`;
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

    // *** REVISED: Show Page (Only for actual page navigation) ***
    function showPage(pageId) {
        // --- Make sure no popups are shown when navigating pages ---
        hidePopup(true); // Pass true to skip console log if preferred

        pages.forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });

        // Show power button ONLY on Source pages
        const isSourcePage = ['appletv-page', 'bluray-page', 'cinema-page'].includes(pageId);
        if (powerButton) {
            powerButton.style.display = isSourcePage ? 'inline-flex' : 'none';
        }
        console.log(`Navigated to page: ${pageId}`);
    }

    // *** REVISED: Show Popup Function ***
    function showPopup(popupElement) {
        if (!popupElement) return; // Exit if element is invalid

        hidePopup(true); // Hide any currently open popup first (skip log)

        popupElement.classList.add('show');
        activePopup = popupElement;

        // Highlight corresponding nav button
        navLightingButton?.classList.toggle('active', popupElement.id === 'lighting-popup');
        navMaskingButton?.classList.toggle('active', popupElement.id === 'masking-popup');

        console.log(`Popup shown: ${popupElement.id}`);
    }

    // *** REVISED: Hide Popup Function ***
    function hidePopup(calledInternally = false) { // Added flag
        if (activePopup) {
            activePopup.classList.remove('show');
            if (!calledInternally) { // Avoid double logging
                 console.log(`Popup hidden: ${activePopup.id}`);
            }
            activePopup = null;
             // Always deselect nav buttons when hiding
             navLightingButton?.classList.remove('active');
             navMaskingButton?.classList.remove('active');
        }
    }


    // --- Event Listeners ---

    // Source button clicks -> Use showPage
    sourceButtons.forEach(button => {
        button.addEventListener('click', () => {
            // No need to hide popups here, showPage does it
            const targetPageId = button.getAttribute('data-page');
            if(targetPageId) showPage(targetPageId);
        });
    });

     // Back button clicks -> Use showPage (always to home)
     backButtons.forEach(button => {
        button.addEventListener('click', () => {
             // No need to hide popups here, showPage does it
            const targetPageId = button.getAttribute('data-page');
             if (targetPageId) showPage(targetPageId);
        });
    });

    // Power button click -> Show Power Popup
    powerButton?.addEventListener('click', () => showPopup(powerPopup));

    // Power confirmation clicks
    powerConfirmYes?.addEventListener('click', () => {
        hidePopup();
        console.log("Shutdown Confirmed!");
        // CrComLib Action...
        showPage('home-page'); // Go home
    });
    powerConfirmNo?.addEventListener('click', hidePopup);

    // --- Popup Close Button Listeners ---
    powerPopupClose?.addEventListener('click', hidePopup);
    lightingPopupClose?.addEventListener('click', hidePopup);
    maskingPopupClose?.addEventListener('click', hidePopup);

    // Mute button click
    muteButton?.addEventListener('click', () => {
        const newState = !isMuted;
        updateMuteButtonState(newState);
         console.log(`Mute toggled: ${newState}`);
         // CrComLib Action...
    });

    // Volume Up/Down Hold Logic
    function handleVolumeChange(direction) { /* ... (same) ... */ console.log(`Volume ${direction} PRESSED`); /* CrComLib Action...*/ if (volIntervalTimer) clearInterval(volIntervalTimer); volIntervalTimer = setInterval(()=>{console.log(`Volume ${direction} HELD`); /* CrComLib Action...*/ }, 200); }
    function stopVolumeChange(direction) { /* ... (same) ... */ console.log(`Volume ${direction} RELEASED`); if (volIntervalTimer) { clearInterval(volIntervalTimer); volIntervalTimer = null; } }
    ['mousedown', 'touchstart'].forEach(eventType => { volUpButton?.addEventListener(eventType, (e) => { e.preventDefault(); handleVolumeChange('Up'); }); volDownButton?.addEventListener(eventType, (e) => { e.preventDefault(); handleVolumeChange('Down'); }); });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(eventType => { volUpButton?.addEventListener(eventType, (e) => { e.preventDefault(); stopVolumeChange('Up'); }); volDownButton?.addEventListener(eventType, (e) => { e.preventDefault(); stopVolumeChange('Down'); }); });

    // --- Bottom Bar Navigation Button Listeners -> Use showPopup ---
    // Make sure the IDs match the HTML
    navLightingButton?.addEventListener('click', () => {
        console.log("Lighting button clicked, attempting to show popup..."); // Debug log
        showPopup(lightingPopup);
    });
    navMaskingButton?.addEventListener('click', () => {
        console.log("Masking button clicked, attempting to show popup..."); // Debug log
        showPopup(maskingPopup);
    });


    // --- Lighting Popup Listeners ---
    function handleSliderInput(sliderElement, percentageElement) { /* ... (same) ... */ if (!sliderElement || !percentageElement) return; const value = sliderElement.value; percentageElement.textContent = `${value}%`; const sliderId = sliderElement.id; console.log(`Slider ${sliderId} changed to ${value}%`); /* CrComLib Action...*/ lightingPresetButtons.forEach(btn => btn.classList.remove('active')); activeLightingPreset = null; }
    downlightsSlider?.addEventListener('input', () => handleSliderInput(downlightsSlider, downlightsPercentage));
    sconcesSlider?.addEventListener('input', () => handleSliderInput(sconcesSlider, sconcesPercentage));
    stepsSlider?.addEventListener('input', () => handleSliderInput(stepsSlider, stepsPercentage));
    lightingPresetButtons.forEach(button => { button.addEventListener('click', () => { const presetId = button.id; if (activeLightingPreset !== presetId) { activeLightingPreset = presetId; lightingPresetButtons.forEach(btn => btn.classList.toggle('active', btn.id === presetId)); console.log(`Lighting Preset ${presetId} selected`); /* CrComLib Action...*/ } }); });

    // --- Masking Popup Listeners ---
    maskingButtons.forEach(button => { button.addEventListener('click', () => { const maskId = button.id; if (activeMaskingPreset !== maskId) { activeMaskingPreset = maskId; maskingButtons.forEach(btn => btn.classList.toggle('active', btn.id === maskId)); console.log(`Masking Preset ${maskId} selected`); /* CrComLib Action...*/ } }); });

    // --- Apple TV / Blu-ray Control Button Listeners ---
    /* ... (add all the ATV/BD listeners back in here - they were omitted for brevity but are needed) ... */
    document.getElementById('atv-menu')?.addEventListener('click', () => console.log('ATV Menu Pressed'));
    document.getElementById('atv-tv-home')?.addEventListener('click', () => console.log('ATV TV/Home Pressed'));
    // ... etc for all ATV and BD buttons ...
    document.getElementById('bd-subtitle')?.addEventListener('click', () => console.log('BD Subtitle Pressed'));


    // --- Initialization ---
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    updateVolumeDisplay(currentVolumeDb);
    updateMuteButtonState(isMuted);
    handleSliderInput(downlightsSlider, downlightsPercentage); // Init sliders
    handleSliderInput(sconcesSlider, sconcesPercentage);
    handleSliderInput(stepsSlider, stepsPercentage);

    showPage('home-page'); // Start on home page

    // --- CRESTRON Feedback Examples ---
    /* ... (same CrComLib.subscribeState examples) ... */

    // Cleanup interval
    window.addEventListener('beforeunload', () => { clearInterval(timeInterval); if (volIntervalTimer) clearInterval(volIntervalTimer); });

}); // End DOMContentLoaded