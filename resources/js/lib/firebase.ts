import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import { getAnalytics, type Analytics, isSupported as analyticsSupported } from 'firebase/analytics';

type FirebaseConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
};

function requireEnv(name: string): string {
    const value = (import.meta.env as Record<string, unknown>)[name];
    if (typeof value === 'string' && value.trim() !== '') {
        return value;
    }
    throw new Error(`Variável de ambiente em falta: ${name}`);
}

function firebaseConfigFromEnv(): FirebaseConfig {
    return {
        apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
        authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
        projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
        storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
        appId: requireEnv('VITE_FIREBASE_APP_ID'),
        measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined) || undefined,
    };
}

export const firebaseApp: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfigFromEnv());

/**
 * Analytics só no browser e quando suportado.
 * (Evita erros em SSR/build e browsers sem suporte.)
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const ok = await analyticsSupported();
        if (!ok) {
            return null;
        }
        return getAnalytics(firebaseApp);
    } catch {
        return null;
    }
}

