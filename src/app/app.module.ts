import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { FacebookLoginProvider, VKLoginProvider } from 'angularx-social-login';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './components/auth/auth.component';
import { ChatComponent } from './components/chat/chat.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuardService } from './services/auth-guard.service';
import config from './config';
import { authInterceptorProvider } from './providers/auth-interceptor-provider';
import { serviceClientProvider } from './providers/service-client-provider';

@NgModule({
    declarations: [
        AppComponent,
        AuthComponent,
        ChatComponent,
        NavbarComponent,
        ProfileComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        SocialLoginModule,
        NgbModule,
        HttpClientModule,
        FontAwesomeModule,
        FormsModule
    ],
    providers: [
        authInterceptorProvider,
        AuthGuardService,
        serviceClientProvider,
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
                autoLogin: false,
                providers: [
                    {
                        id: FacebookLoginProvider.PROVIDER_ID,
                        provider: new FacebookLoginProvider(config.facebookAppId),
                    },
                    {
                        id: VKLoginProvider.PROVIDER_ID,
                        provider: new VKLoginProvider(config.vkAppId),
                    }],
            } as SocialAuthServiceConfig,
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
