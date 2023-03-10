import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './components/auth/auth.component';
import { ChatComponent } from './components/chat/chat.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuardService } from './services/auth-guard.service';
import { environment } from '../environments/environment';
import { authInterceptorProvider } from './providers/auth-interceptor-provider';
import { API_BASE_URL } from './api-client/api-client';
import { ApiClientProvider } from './providers/api-client-provider';
import { AccountListComponent } from './components/account-list/account-list.component';
import { MessagerComponent } from './components/messager/messager.component';
import { AccountListItemComponent } from './components/account-list-item/account-list-item.component';
import { SocialLoginModule } from '@abacritt/angularx-social-login';
import { BrowserModule } from '@angular/platform-browser';
import { MessageComponent } from './components/message/message.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoggedInUserComponent } from './components/logged-in-user/logged-in-user.component';
import { SocialMediaIconComponent } from './components/social-media-icon/social-media-icon.component';
import { ChatHeaderComponent } from './components/chat-header/chat-header.component';
import { StoreModule } from '@ngrx/store';
import { StoreConfig } from './state/store-config';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { OrderByPipe } from './pipes/orderby';
import { SocialAuthProvider } from './providers/social-auth-provider';

@NgModule({
    declarations: [
        AppComponent,
        AuthComponent,
        ChatComponent,
        ProfileComponent,
        AccountListComponent,
        MessagerComponent,
        AccountListItemComponent,
        MessageComponent,
        LoggedInUserComponent,
        SocialMediaIconComponent,
        ChatHeaderComponent,
        SidebarComponent,
        OrderByPipe
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
        ToastrModule.forRoot(),
        StoreModule.forRoot(StoreConfig)
    ],
    providers: [
        authInterceptorProvider,
        AuthGuardService,
        ApiClientProvider,
        SocialAuthProvider,
        {
            provide: API_BASE_URL,
            useFactory: () => {
                return environment.apiBaseUrl;
            }
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
