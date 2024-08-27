import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, UrlTree, createUrlTreeFromSnapshot } from '@angular/router';
import { StoreService } from '../services/store.service';

// https://blog.herodevs.com/functional-router-guards-in-angular-15-open-the-door-to-happier-code-4a53bb60f78a
export const profileGuard = async (next: ActivatedRouteSnapshot) => {
    const storeService = inject(StoreService);

    try {
        const account = await storeService.getLoggedInUser();
        if (account) {
            return !!account?.firstName && !!account?.lastName ? true : createUrlTreeFromSnapshot(next, ['/', 'profile']);
        } else {
            window.localStorage.clear();
            return createUrlTreeFromSnapshot(next, ['/', 'auth']);
        }
    }
    catch (e) {
        window.localStorage.clear();
        return createUrlTreeFromSnapshot(next, ['/', 'auth']);
    }
};