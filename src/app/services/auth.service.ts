import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { TokenStorageService } from './token-storage.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { SignalrService } from './signalr.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(
        private socialAuthService: SocialAuthService,
        private apiService: ApiService,
        private tokenStorage: TokenStorageService,
        private router: Router,
        private signalrService: SignalrService) { }

    signIn(providerId: string): void {
        this.socialAuthService.signIn(providerId)
            .then(async response => {
                this.apiService.login(response).subscribe(data => {
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
