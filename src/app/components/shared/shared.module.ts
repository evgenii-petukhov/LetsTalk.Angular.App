import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BackButtonComponent } from './back-button/back-button.component';
import { AvatarComponent } from './avatar/avatar.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { OrderByPipe } from 'src/app/pipes/orderby';

@NgModule({
    declarations: [
        BackButtonComponent,
        AvatarComponent,
        UserDetailsComponent,
        OrderByPipe,
    ],
    imports: [CommonModule, FontAwesomeModule],
    exports: [
        BackButtonComponent,
        AvatarComponent,
        UserDetailsComponent,
        OrderByPipe,
    ],
})
export class SharedModule {}
