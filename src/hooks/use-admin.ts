'use client';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';

export function useAdmin() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(
        () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
        [firestore, user]
    );

    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const isLoading = isAuthLoading;
    const isAdmin = !isLoading && userProfile?.role === 'Admin';

    return { isAdmin, isLoading };
}
