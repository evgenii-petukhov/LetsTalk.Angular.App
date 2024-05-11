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
import { environment } from '../environments/environment';
import { authInterceptorProvider } from './providers/auth-interceptor-provider';
import { API_BASE_URL } from './api-client/api-client';
import { apiClientProvider } from './providers/api-client-provider';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { MessengerComponent } from './components/messenger/messenger.component';
import { ChatListItemComponent } from './components/chat-list-item/chat-list-item.component';
import { SocialLoginModule } from '@abacritt/angularx-social-login';
import { BrowserModule } from '@angular/platform-browser';
import { MessageComponent } from './components/message/message.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoggedInUserComponent } from './components/logged-in-user/logged-in-user.component';
import { SocialMediaIconComponent } from './components/social-media-icon/social-media-icon.component';
import { ChatHeaderComponent } from './components/chat-header/chat-header.component';
import { StoreModule } from '@ngrx/store';
import { storeConfig } from './state/store-config';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { OrderByPipe } from './pipes/orderby';
import { socialAuthProvider } from './providers/social-auth-provider';
import { VisibleOnlyPipe } from './pipes/visibleOnly';
import { ReactiveFormsModule } from '@angular/forms';
import { AvatarComponent } from './components/avatar/avatar.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { ImageComponent } from './components/image/image.component';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { httpLogInterceptorProvider } from './providers/http-log-interceptor-provider';
import { grpcLogInterceptorProvider } from './providers/grpc-log-interceptor-provider';
import { AccountListComponent } from './components/account-list/account-list.component';
import { AccountListItemComponent } from './components/account-list-item/account-list-item.component';
import { LoginByEmailComponent } from './components/login-by-email/login-by-email.component';

@NgModule({
    declarations: [
        AppComponent,
        AuthComponent,
        ChatComponent,
        ProfileComponent,
        ChatListComponent,
        AccountListComponent,
        MessengerComponent,
        ChatListItemComponent,
        AccountListItemComponent,
        MessageComponent,
        LoggedInUserComponent,
        SocialMediaIconComponent,
        ChatHeaderComponent,
        SidebarComponent,
        OrderByPipe,
        VisibleOnlyPipe,
        AvatarComponent,
        PrivacyPolicyComponent,
        ImageComponent,
        ImageViewerComponent,
        LoginByEmailComponent
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
        StoreModule.forRoot(storeConfig),
        ReactiveFormsModule
    ],
    providers: [
        authInterceptorProvider,
        httpLogInterceptorProvider,
        grpcLogInterceptorProvider,
        apiClientProvider,
        socialAuthProvider,
        {
            provide: API_BASE_URL,
            useFactory: () => environment.services.api.url
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
