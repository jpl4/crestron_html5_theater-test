// Wait until the webpage structure (DOM) is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- Get References to Important Elements ---
    const timeDisplay = document.getElementById('time-display');
    const pages = document.querySelectorAll('.page');
    const sourceButtons = document.querySelectorAll('.source-button');
    const backButtons = document.querySelectorAll('.back-button');
    const powerButton = document.getElementById('power-button');

    // Popups & Controls
    const powerPopup = document.getElementById('power-popup');
    const powerConfirmYes = document.getElementById('power-confirm-yes');
    const powerConfirmNo = document.getElementById('power-confirm-no');
    const powerPopupClose = document.getElementById('power-popup-close'); // Added close button ref

    const lightingPopup = document.getElementById('lighting-popup'); // NEW
    const lightingPopupClose = document.getElementById('lighting-popup-close'); // NEW
    const maskingPopup = document.getElementById('masking-popup'); // NEW
    const maskingPopupClose = document.getElementById('masking-popup-close'); // NEW

    // Bottom Bar Buttons
    const navLightingButton = document.getElementById('nav-lighting-button');
    const navMaskingButton = document.getElementById('nav-masking-button');
    const volumeLevelDisplay = document.getElementById('volume-level');
    const muteButton = document.getElementById('mute-button');
    const volUpButton = document.querySelector('.vol-up');
    const volDownButton = document.querySelector('.vol-down');

    // Lighting Popup Controls
    const downlightsSlider = document.getElementById('downlights-slider');
    const sconcesSlider = document.getElementById('sconces-slider');
    const stepsSlider = document.getElementById('steps-slider');
    const downlightsPercentage = document.getElementById('downlights-percentage');
    const sconcesPercentage = document.getElementById('sconces-percentage');
    const stepsPercentage = document.getElementById('steps-percentage');
    const lightingPresetButtons = document.querySelectorAll('.preset-button');

    // Masking Popup Controls
    const maskingButtons = document.querySelectorAll('.masking-button');

    // --- State Variables ---
    let currentVolumeDb = -45.0;
    let isMuted = false;
    let volIntervalTimer = null;
    let activeLightingPreset = null;
    let activeMaskingPreset = null;
    let activePopup = null; // Track which popup is open

    // --- Functions ---

    // Update time display (No changes)
    function updateTime() { /* ... (same as before) ... */ }

    // Update volume display (No changes)
    function updateVolumeDisplay(dbValue) { /* ... (same as before) ... */ }

     // Update mute button visual state (No changes)
     function updateMuteButtonState(muted) { /* ... (same as before) ... */ }

    // *** MODIFIED: Show Page (Handles non-popup pages) ***
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });
        // Show power button ONLY on Source pages
        const isSourcePage = ['appletv-page', 'bluray-page', 'cinema-page'].includes(pageId);
        if (powerButton) {
            powerButton.style.display = isSourcePage ? 'inline-flex' : 'none';
        }
        // Deselect bottom bar buttons when navigating to a page
        navLightingButton?.classList.remove('active');
        navMaskingButton?.classList.remove('active');

        console.log(`Navigated to page: ${pageId}`);
    }

    // *** NEW: Show Popup Function ***
    function showPopup(popupElement) {
        hidePopup(); // Hide any currently open popup first
        if (popupElement) {
            popupElement.classList.add('show');
            activePopup = popupElement; // Track the open popup
            // Highlight corresponding nav button (optional)
            if (popupElement.id === 'lighting-popup') navLightingButton?.classList.add('active');
            if (popupElement.id === 'masking-popup') navMaskingButton?.classList.add('active');
            console.log(`Popup shown: ${popupElement.id}`);
        }
    }

    // *** NEW: Hide Popup Function ***
    function hidePopup() {
        if (activePopup) {
            activePopup.classList.remove('show');
            console.log(`Popup hidden: ${activePopup.id}`);
        }
        // Always remove active state from nav buttons when hiding
        navLightingButton?.classList.remove('active');
        navMaskingButton?.classList.remove('active');
        activePopup = null;
    }

    // --- Event Listeners ---

    // Source button clicks -> Use showPage
    sourceButtons.forEach(button => {
        button.addEventListener('click', () => {
            hidePopup(); // Ensure popups are closed when selecting a source
            const targetPageId = button.getAttribute('data-page');
            if(targetPageId) showPage(targetPageId);
        });
    });

     // Back button clicks -> Use showPage (always to home)
     backButtons.forEach(button => {
        button.addEventListener('click', () => {
            hidePopup(); // Ensure popups are closed
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
    powerPopupClose?.addEventListener('click', hidePopup); // Close button

    // Mute button click (No change in logic)
    muteButton?.addEventListener('click', () => { /* ... (same as before) ... */ });

    // Volume Up/Down Hold Logic (No changes)
    function handleVolumeChange(direction) { /* ... (same as before) ... */ }
    function stopVolumeChange(direction) { /* ... (same as before) ... */ }
    ['mousedown', 'touchstart'].forEach(eventType => { /* ... (same as before) ... */ });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(eventType => { /* ... (same as before) ... */ });

    // --- Bottom Bar Navigation Button Listeners -> Use showPopup ---
    navLightingButton?.addEventListener('click', () => showPopup(lightingPopup));
    navMaskingButton?.addEventListener('click', () => showPopup(maskingPopup));

    // --- Popup Close Button Listeners ---
    lightingPopupClose?.addEventListener('click', hidePopup);
    maskingPopupClose?.addEventListener('click', hidePopup);

    // --- Lighting Popup Listeners ---
    function handleSliderInput(sliderElement, percentageElement) {
        if (!sliderElement || !percentageElement) return;
        const value = sliderElement.value;
        percentageElement.textContent = `${value}%`;
        // --- CRESTRON ---
        const sliderId = sliderElement.id;
        console.log(`Slider ${sliderId} changed to ${value}%`);
        // CrComLib Action...
        // Deactivate any active preset button
        lightingPresetButtons.forEach(btn => btn.classList.remove('active'));
        activeLightingPreset = null;
    }
    downlightsSlider?.addEventListener('input', () => handleSliderInput(downlightsSlider, downlightsPercentage));
    sconcesSlider?.addEventListener('input', () => handleSliderInput(sconcesSlider, sconcesPercentage));
    stepsSlider?.addEventListener('input', () => handleSliderInput(stepsSlider, stepsPercentage));

    lightingPresetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const presetId = button.id;
            if (activeLightingPreset !== presetId) {
                activeLightingPreset = presetId;
                lightingPresetButtons.forEach(btn => btn.classList.toggle('active', btn.id === presetId));
                // --- CRESTRON ---
                console.log(`Lighting Preset ${presetId} selected`);
                // CrComLib Action...
            }
        });
    });

    // --- Masking Popup Listeners ---
    maskingButtons.forEach(button => {
        button.addEventListener('click', () => {
            const maskId = button.id;
             if (activeMaskingPreset !== maskId) {
                activeMaskingPreset = maskId;
                maskingButtons.forEach(btn => btn.classList.toggle('active', btn.id === maskId));
                // --- CRESTRON ---
                console.log(`Masking Preset ${maskId} selected`);
                // CrComLib Action...
            }
        });
    });

    // --- Apple TV / Blu-ray Control Button Listeners (No changes) ---
    /* ... (same listeners as before) ... */


    // --- Initialization ---
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    updateVolumeDisplay(currentVolumeDb);
    updateMuteButtonState(isMuted);

    // Initialize slider percentages
    handleSliderInput(downlightsSlider, downlightsPercentage);
    handleSliderInput(sconcesSlider, sconcesPercentage);
    handleSliderInput(stepsSlider, stepsPercentage);

    showPage('home-page'); // Start on home page

    // --- CRESTRON Feedback Examples (No changes needed here, just ensure joins are correct) ---
    /* ... (same CrComLib.subscribeState examples as before) ... */

    // Cleanup interval
    window.addEventListener('beforeunload', () => { /* ... (same as before) ... */ });

}); // End DOMContentLoaded