// ManMitra client environment configuration

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

// Compute the matching WebSocket URL dynamically (http -> ws, https -> wss)
export const WS_URL = API_URL.replace(/^http/, 'ws');

