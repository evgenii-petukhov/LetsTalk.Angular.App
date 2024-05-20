import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, UrlTree, createUrlTreeFromSnapshot } from '@angular/router';
import { StoreService } from '../services/store.service';

// https://blog.herodevs.com/functional-router-guards-in-angular-15-open-the-door-to-happier-code-4a53bb60f78a
export const profileGuard = (next: ActivatedRouteSnapshot) => {
    const storeService = inject(StoreService);

    return new Promise<boolean | UrlTree>(resolve => {
        storeService.getLoggedInUser().then(
            account => {
                if (account) {
                    resolve(!!account?.firstName && !!account?.lastName ? true : createUrlTreeFromSnapshot(next, ['/', 'profile']));
                } else {
                    window.localStorage.clear();
                    resolve(createUrlTreeFromSnapshot(next, ['/', 'auth']));
                }
            },
            () => {
                window.localStorage.clear();
                resolve(createUrlTreeFromSnapshot(next, ['/', 'auth']));
            });
    });
};