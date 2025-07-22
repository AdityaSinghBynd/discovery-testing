import * as amplitude from '@amplitude/analytics-browser';

let isInitialized = false;

// Initialize Amplitude
export const initializeAmplitude = (userId = null) => {
    if (!isInitialized && process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
        amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY, {
            defaultTracking: {
                pageViews: true,
                sessions: true
            },
            userId: `Bynd_${userId}`,
            logLevel: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? 'DEBUG' : undefined,
        });

        isInitialized = true;
    } else if (isInitialized && userId) {
        // Update userId if Amplitude is already initialized
        amplitude.setUserId(`Bynd_${userId}`);
    }
};

// Track a custom event
export const trackEvent = (eventName, eventProperties = {}) => {
    if (!isInitialized) {
        console.error("Amplitude is not initialized. Call initializeAmplitude first.");
        return;
    }
    amplitude.track(eventName, eventProperties);
};

// Start a user session
export const startUserSession = (userId) => {
    if (!isInitialized) {
        console.error("Amplitude is not initialized. Call initializeAmplitude first.");
        return;
    }
    amplitude.setUserId(`Bynd_${userId}`);
    trackEvent('Session Start', { userId: `Bynd_${userId}`, timestamp: new Date().toISOString() });
};

// Track user properties
export const trackUserProperties = (userId, userProperties = {}) => {
    if (!isInitialized) {
        console.error("Amplitude is not initialized. Call initializeAmplitude first.");
        return;
    }
    amplitude.setUserId(`Bynd_${userId}`);
    amplitude.identify({
        user_properties: userProperties,
    });
};

// Track a page view (optional if not using default tracking)
export const trackPageView = (url) => {
    if (!isInitialized) {
        console.error("Amplitude is not initialized. Call initializeAmplitude first.");
        return;
    }
    trackEvent('Page Viewed', { url });
};

export const trackSimilarTableModal = (tableId, selectedTables, selectedDocs) => {
    trackEvent('Similar Table Modal Viewed', { tableId, selectedTables, selectedDocs });
};

//button click events
export const trackButtonClick = (buttonName) => {
    trackEvent('Button Clicked', { buttonName });
};

export const trackAskAIModal = (modalName) => {
    trackEvent('Ask AI Modal Viewed', { modalName });
};

export const trackFinancialStatementsModal = (modalName) => {
    trackEvent('Financial Statements Modal Viewed', { modalName });
};

export const trackDocumentActionsModal = (modalName) => {
    trackEvent('Document Actions Modal Viewed', { modalName });
};

export const trackDocumentsModal = (modalName) => {
    trackEvent('Documents Modal Viewed', { modalName });
};  
