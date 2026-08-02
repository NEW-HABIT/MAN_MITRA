// ManMitra client environment configuration

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return 'http://127.0.0.1:8000';
};

export const API_URL = getApiUrl();

// Compute the matching WebSocket URL dynamically (http -> ws, https -> wss)
export const WS_URL = API_URL.replace(/^http/, 'ws');


