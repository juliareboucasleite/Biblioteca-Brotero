import type { Auth, StaffBibliotecaShared } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            staffBiblioteca: StaffBibliotecaShared;
            sidebarOpen: boolean;
            flash: {
                success: string | null;
                error: string | null;
            };
            [key: string]: unknown;
        };
    }
}
