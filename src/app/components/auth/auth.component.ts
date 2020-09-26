import { Component, OnInit } from '@angular/core';

import { SocialAuthService } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import {
  FacebookLoginProvider,
} from 'angularx-social-login';
import { AuthService } from 'src/app/services/auth.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  socialUser: SocialUser;

  constructor(
    private socialAuthService: SocialAuthService,
    private authService: AuthService,
    private tokenStorage: TokenStorageService) { }

  ngOnInit() {
    this.socialAuthService.authState.subscribe(user => {
      this.socialUser = user;
    });
  }

  signInWithFB(): void {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID)
      .then(facebookResponse => {
        this.authService.loginViaFacebook(facebookResponse).subscribe(
          data => {
            this.tokenStorage.saveToken(data.token);
            this.tokenStorage.saveUser(data);
            this.reloadPage();
          }
        );
      });
  }

  signOut(): void {
    this.socialAuthService.signOut();
  }

  reloadPage() {
    window.location.reload();
  }
}
