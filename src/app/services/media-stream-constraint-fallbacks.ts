export const mediaStreamConstraintFallbacks: MediaStreamConstraints[] = [
    // Standard
    {
        video: {
            width: { ideal: 640, max: 640 },
            height: { ideal: 480, max: 480 },
            frameRate: { ideal: 15, max: 30 },
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: { ideal: 44100 },
            channelCount: { ideal: 1 },
        },
    },
    // Relaxed
    {
        video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 15 },
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: { ideal: 1 },
        },
    },
    // Basic
    {
        video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
        },
        audio: {
            echoCancellation: true,
        },
    },
    // Simple
    {
        video: true,
        audio: true,
    },
];