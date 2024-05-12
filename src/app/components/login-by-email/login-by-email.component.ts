import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';

@Component({
    selector: 'app-login-by-email',
    templateUrl: './login-by-email.component.html',
    styleUrl: './login-by-email.component.scss'
})
export class LoginByEmailComponent {

    form = this.fb.group({
        email: ['', [Validators.email, Validators.required]],
        code: ['', [Validators.pattern('[0-9]{4}'), Validators.required]]
    });

    isCodeRequested = false;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private apiService: ApiService,
        private tokenStorage: TokenStorageService) { }

    onSubmit(): void {
        this.apiService.loginByEmail(this.form.value.email, Number(this.form.value.code)).pipe(take(1)).subscribe(data => {
            this.tokenStorage.saveToken(data.token);
            this.tokenStorage.saveUser(data);
            this.router.navigate(['chats']);
        });
    }

    onBack(): void {
        this.router.navigate(['chats']);
    }

    onCodeRequested(): void {
        this.apiService.generateLoginCode(this.form.value.email).pipe(take(1)).subscribe(() => {
            this.isCodeRequested = true;
        });
    }
}
