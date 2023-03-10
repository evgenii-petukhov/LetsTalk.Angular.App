import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { SocialUser, SocialAuthService, FacebookLoginProvider, VKLoginProvider } from '@abacritt/angularx-social-login';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

    socialUser: SocialUser;
    isVkProviderAvailable = !!(environment as any).vkAppId;

    constructor(
        private socialAuthService: SocialAuthService,
        private apiService: ApiService,
        private tokenStorage: TokenStorageService,
        private router: Router) { }

    ngOnInit() {
        this.socialAuthService.authState.subscribe(user => {
            this.socialUser = user;
        });
    }

    signInWithFB(): void {
        this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID)
            .then(async response => {
                this.apiService.login(response).subscribe(data => {
                    this.tokenStorage.saveToken(data.token);
                    this.tokenStorage.saveUser(data);
                    this.router.navigate(['chats']);
                });
            });
    }

    signInWithVK(): void {
        this.socialAuthService.signIn(VKLoginProvider.PROVIDER_ID)
            .then(async response => {
                this.apiService.login(response).subscribe(data => {
                    this.tokenStorage.saveToken(data.token);
                    this.tokenStorage.saveUser(data);
                    this.router.navigate(['chats']);
                });
            });
    }

    signOut(): void {
        this.socialAuthService.signOut();
    }

    reloadPage() {
        window.location.reload();
    }
}
