import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './components/auth/auth.component';
import { ChatComponent } from './components/chat/chat.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuardService } from './services/auth-guard.service';
import config from './config';
import { authInterceptorProvider } from './providers/auth-interceptor-provider';
import { API_BASE_URL } from './api-client/api-client';
import { ApiClientProvider } from './providers/api-client-provider';
import { AccountListComponent } from './components/account-list/account-list.component';
import { MessagerComponent } from './components/messager/messager.component';
import { AccountListItemComponent } from './components/account-list-item/account-list-item.component';
import {
    SocialLoginModule, 
    FacebookLoginProvider, 
    VKLoginProvider, 
    SocialAuthServiceConfig 
} from '@abacritt/angularx-social-login';
import { BrowserModule } from '@angular/platform-browser';
import { MessageComponent } from './components/message/message.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        AppComponent,
        AuthComponent,
        ChatComponent,
        NavbarComponent,
        ProfileComponent,
        AccountListComponent,
        MessagerComponent,
        AccountListItemComponent,
        MessageComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        SocialLoginModule,
        NgbModule,
        HttpClientModule,
        FontAwesomeModule,
        FormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot()
    ],
    providers: [
        authInterceptorProvider,
        AuthGuardService,
        ApiClientProvider,
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
        },
        {
            provide: API_BASE_URL,
            useFactory: () => {
                return config.apiBaseUrl;
            }
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
