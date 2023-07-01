import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { TokenStorageService } from './token-storage.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { SignalrService } from './signalr.service';
import { Subject, takeUntil } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy {

    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private socialAuthService: SocialAuthService,
        private apiService: ApiService,
        private tokenStorage: TokenStorageService,
        private router: Router,
        private signalrService: SignalrService) { }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    signIn(providerId: string): void {
        this.socialAuthService.signIn(providerId)
            .then(async response => {
                this.apiService.login(response).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    this.tokenStorage.saveToken(data.token);
                    this.tokenStorage.saveUser(data);
                    this.router.navigate(['chats']);
                });
            });
    }

    signOut(): void {
        this.signalrService.removeHandlers();
        this.socialAuthService.signOut();
    }
}
