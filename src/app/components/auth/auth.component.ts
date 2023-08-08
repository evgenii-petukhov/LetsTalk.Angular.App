import { Component } from '@angular/core';
import { FacebookLoginProvider, VKLoginProvider } from '@abacritt/angularx-social-login';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent {

    isVkProviderAvailable = !!(environment as any).login.vkAppId;

    constructor(
        private authService: AuthService
    ) { }

    signInWithFB(): void {
        this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
    }

    signInWithVK(): void {
        this.authService.signIn(VKLoginProvider.PROVIDER_ID);
    }

    signOut(): void {
        this.authService.signOut();
    }
}
