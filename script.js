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
    function updateTime() { /* ... (same) ... */ }

    // Update volume display
    function updateVolumeDisplay(dbValue) { /* ... (same) ... */ }

     // Update mute button visual state
     function updateMuteButtonState(muted) { /* ... (same) ... */ }

    // Show Page (Only for actual page navigation)
    function showPage(pageId) { /* ... (same - hides popups) ... */ }

    // Show Popup Function
    function showPopup(popupElement) { /* ... (same) ... */ }

    // Hide Popup Function
    function hidePopup(calledInternally = false) { /* ... (same) ... */ }


    // --- Event Listeners ---

    // Source button clicks -> Use showPage
    sourceButtons.forEach(button => { button.addEventListener('click', () => { const targetPageId = button.getAttribute('data-page'); if(targetPageId) showPage(targetPageId); }); });

     // Back button clicks -> Use showPage (always to home)
     backButtons.forEach(button => { button.addEventListener('click', () => { const targetPageId = button.getAttribute('data-page'); if (targetPageId) showPage(targetPageId); }); });

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
    muteButton?.addEventListener('click', () => { /* ... (same) ... */ });

    // Volume Up/Down Hold Logic
    function handleVolumeChange(direction) { /* ... (same) ... */ }
    function stopVolumeChange(direction) { /* ... (same) ... */ }
    ['mousedown', 'touchstart'].forEach(eventType => { /* ... (same) ... */ });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(eventType => { /* ... (same) ... */ });

    // --- Bottom Bar Navigation Button Listeners -> Use showPopup ---
    navLightingButton?.addEventListener('click', () => showPopup(lightingPopup));
    navMaskingButton?.addEventListener('click', () => showPopup(maskingPopup));

    // --- Lighting Popup Listeners ---
    // *** UPDATED: handleSliderInput to set CSS variable for gradient fill ***
    function handleSliderInput(sliderElement, percentageElement) {
        if (!sliderElement || !percentageElement) return;
        const value = sliderElement.value;
        percentageElement.textContent = `${value}%`;

        // Set CSS custom property for gradient background
        sliderElement.style.setProperty('--value-percent', `${value}%`);

        // --- CRESTRON INTEGRATION POINT ---
        const sliderId = sliderElement.id;
        console.log(`Slider ${sliderId} changed to ${value}%`);
        // Example: CrComLib Action...

        // Deactivate any active preset button when a slider is manually moved
        lightingPresetButtons.forEach(btn => btn.classList.remove('active'));
        activeLightingPreset = null;
    }

    // Initialize slider gradients on load AND add listeners
    [downlightsSlider, sconcesSlider, stepsSlider].forEach(slider => {
        if (slider) {
            // Set initial gradient fill
            handleSliderInput(slider, slider.parentElement.parentElement.querySelector('.slider-percentage'));
            // Add listener
            slider.addEventListener('input', () => handleSliderInput(slider, slider.parentElement.parentElement.querySelector('.slider-percentage')));
        }
    });

    lightingPresetButtons.forEach(button => { button.addEventListener('click', () => { const presetId = button.id; if (activeLightingPreset !== presetId) { activeLightingPreset = presetId; lightingPresetButtons.forEach(btn => btn.classList.toggle('active', btn.id === presetId)); console.log(`Lighting Preset ${presetId} selected`); /* CrComLib Action...*/ // Optionally: Update sliders visually based on preset here if no Crestron feedback } }); });

    // --- Masking Popup Listeners ---
    maskingButtons.forEach(button => { button.addEventListener('click', () => { const maskId = button.id; if (activeMaskingPreset !== maskId) { activeMaskingPreset = maskId; maskingButtons.forEach(btn => btn.classList.toggle('active', btn.id === maskId)); console.log(`Masking Preset ${maskId} selected`); /* CrComLib Action...*/ } }); });

    // --- Apple TV / Blu-ray Control Button Listeners ---
    /* ... (Insert all the ATV/BD listeners here again - essential!) ... */
    document.getElementById('atv-menu')?.addEventListener('click', () => console.log('ATV Menu Pressed'));
    // ... all others ...
    document.getElementById('bd-subtitle')?.addEventListener('click', () => console.log('BD Subtitle Pressed'));


    // --- Initialization ---
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    updateVolumeDisplay(currentVolumeDb);
    updateMuteButtonState(isMuted);
    // Sliders initialized in the loop above

    showPage('home-page'); // Start on home page

    // --- CRESTRON Feedback Examples ---
    /* ... (Same examples, ensure feedback updates slider .value AND calls handleSliderInput to update visual gradient) ... */
    // Example Light Level Feedback update:
    // CrComLib.subscribeState('n', '301', (value) => { // Feedback from downlights level (e.g., analog join 301)
    //    const percent = Math.round((value / 65535) * 100);
    //    if (downlightsSlider) {
    //        downlightsSlider.value = percent;
    //        handleSliderInput(downlightsSlider, downlightsPercentage); // Update visual fill
    //    }
    // });


    // Cleanup interval
    window.addEventListener('beforeunload', () => { clearInterval(timeInterval); if (volIntervalTimer) clearInterval(volIntervalTimer); });

}); // End DOMContentLoaded