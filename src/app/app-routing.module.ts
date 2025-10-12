import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { MessengerComponent } from './components/messenger/messenger.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authenticatedOnlyGuard } from './guards/authenticated-only-guard';
import { completeProfileGuard } from './guards/complete-profile-guard';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { LoginByEmailComponent } from './components/login-by-email/login-by-email.component';
import { anonymousOnlyGuard } from './guards/anonymous-only-guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/chats',
        pathMatch: 'full',
    },
    {
        path: 'sign-in',
        component: SignInComponent,
        canActivate: [anonymousOnlyGuard],
    },
    {
        path: 'login-by-email',
        component: LoginByEmailComponent,
        canActivate: [anonymousOnlyGuard],
    },
    {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
    },
    {
        path: 'chats',
        component: MessengerComponent,
        canActivate: [authenticatedOnlyGuard, completeProfileGuard],
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authenticatedOnlyGuard],
    },
    {
        path: '**',
        redirectTo: '/chats',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
