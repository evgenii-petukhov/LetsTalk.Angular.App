import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BackButtonComponent } from './back-button/back-button.component';
import { AvatarComponent } from './avatar/avatar.component';

@NgModule({
    declarations: [BackButtonComponent, AvatarComponent],
    imports: [CommonModule, FontAwesomeModule],
    exports: [BackButtonComponent, AvatarComponent],
})
export class SharedModule {}
