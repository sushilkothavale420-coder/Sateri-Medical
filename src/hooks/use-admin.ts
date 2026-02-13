'use client';
import { useUser } from '@/firebase';

export function useAdmin() {
    const { isUserLoading, isProfileLoading, userProfile } = useUser();

    const isLoading = isUserLoading || isProfileLoading;
    const isAdmin = !isLoading && !!userProfile && userProfile.role === 'Admin';

    return { isAdmin, isLoading };
}
