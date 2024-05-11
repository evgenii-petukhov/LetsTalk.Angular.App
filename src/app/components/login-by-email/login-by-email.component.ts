import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login-by-email',
    templateUrl: './login-by-email.component.html',
    styleUrl: './login-by-email.component.scss'
})
export class LoginByEmailComponent {

    form = this.fb.group({
        email: ['', Validators.email],
        code: ['', Validators.pattern('[0-9]{4}')]
    });

    constructor(
        private router: Router,
        private fb: FormBuilder) { }

    onSubmit(): void {

    }

    onBack(): void {
        this.router.navigate(['chats']);
    }
}
