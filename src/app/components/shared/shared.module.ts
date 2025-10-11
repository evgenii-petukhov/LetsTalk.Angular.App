import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BackButtonComponent } from './back-button/back-button.component';
import { AvatarComponent } from './avatar/avatar.component';
import { UserDetailsComponent } from './user-details/user-details.component';

@NgModule({
    declarations: [BackButtonComponent, AvatarComponent, UserDetailsComponent],
    imports: [CommonModule, FontAwesomeModule],
    exports: [BackButtonComponent, AvatarComponent, UserDetailsComponent],
})
export class SharedModule {}
