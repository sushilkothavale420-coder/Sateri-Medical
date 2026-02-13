'use client';
import { useUser } from '@/firebase';

export function useAdmin() {
    const { user, isUserLoading } = useUser();

    // For this prototype, we will consider any authenticated user to be an admin.
    // This avoids the need for a separate user profile document in the database.
    const isLoading = isUserLoading;
    const isAdmin = !isLoading && !!user;

    return { isAdmin, isLoading };
}
