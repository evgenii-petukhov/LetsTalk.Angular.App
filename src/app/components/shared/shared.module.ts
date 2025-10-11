import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BackButtonComponent } from './back-button/back-button.component';

@NgModule({
    declarations: [BackButtonComponent],
    imports: [CommonModule, FontAwesomeModule],
    exports: [BackButtonComponent],
})
export class SharedModule {}
