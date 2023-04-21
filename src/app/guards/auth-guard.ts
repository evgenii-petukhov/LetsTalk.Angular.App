import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

// https://blog.herodevs.com/functional-router-guards-in-angular-15-open-the-door-to-happier-code-4a53bb60f78a
export const authGuard = (next: ActivatedRouteSnapshot) => inject(TokenStorageService)
    .isLoggedIn() ? true : createUrlTreeFromSnapshot(next, ['/', 'auth']);
