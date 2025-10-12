import {
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './components/chat/chat.component';
import { ProfileComponent } from './components/profile/profile.component';
import { environment } from '../environments/environment';
import { authInterceptorProvider } from './providers/auth-interceptor-provider';
import { API_BASE_URL } from './api-client/api-client';
import { apiClientProvider } from './providers/api-client-provider';
import { MessengerComponent } from './components/messenger/messenger.component';
import { BrowserModule } from '@angular/platform-browser';
import { MessageComponent } from './components/message/message.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatHeaderComponent } from './components/chat-header/chat-header.component';
import { StoreModule } from '@ngrx/store';
import { storeConfig } from './state/store-config';
import { VisibleOnlyPipe } from './pipes/visibleOnly';
import { ReactiveFormsModule } from '@angular/forms';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { ImageComponent } from './components/image/image.component';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { httpLogInterceptorProvider } from './providers/http-log-interceptor-provider';
import { grpcLogInterceptorProvider } from './providers/grpc-log-interceptor-provider';
import { SendMessageComponent } from './components/send-message/send-message.component';
import { SendMessageButtonComponent } from './components/send-message-button/send-message-button.component';
import { SelectImageButtonComponent } from './components/select-image-button/select-image-button.component';
import { SharedModule } from './components/shared/shared.module';
import { SidebarModule } from './components/sidebar/sidebar.module';
import { SignInModule } from './components/sign-in/sign-in.module';

@NgModule({
    declarations: [
        AppComponent,
        ChatComponent,
        ProfileComponent,
        MessengerComponent,
        MessageComponent,
        ChatHeaderComponent,
        VisibleOnlyPipe,
        PrivacyPolicyComponent,
        ImageComponent,
        ImageViewerComponent,
        SendMessageComponent,
        SendMessageButtonComponent,
        SelectImageButtonComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgbModule,
        FontAwesomeModule,
        FormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        StoreModule.forRoot(storeConfig),
        ReactiveFormsModule,
        SharedModule,
        SidebarModule,
        SignInModule,
    ],
    providers: [
        authInterceptorProvider,
        httpLogInterceptorProvider,
        grpcLogInterceptorProvider,
        apiClientProvider,
        provideHttpClient(withInterceptorsFromDi()),
        {
            provide: API_BASE_URL,
            useFactory: () => environment.services.api.url,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
