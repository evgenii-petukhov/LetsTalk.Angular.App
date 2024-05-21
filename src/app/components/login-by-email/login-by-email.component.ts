import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { LoginResponseDto } from 'src/app/api-client/api-client';
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
        code: ['', [Validators.pattern('\\s*\\d{4}\\s*'), Validators.required]]
    });

    isCodeRequested = false;
    codeValidInSeconds = 0;
    codeValidTimerId = 0;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private apiService: ApiService,
        private tokenStorage: TokenStorageService,
        private toastr: ToastrService) { }

    onSubmit(): void {
        this.apiService.loginByEmail(this.form.value.email, Number(this.form.value.code)).pipe(take(1)).subscribe({
            next: (loginResponseDto: LoginResponseDto) => {
                this.tokenStorage.saveToken(loginResponseDto.token);
                this.tokenStorage.saveUser(loginResponseDto);
                this.router.navigate(['chats']);
            },
            error: e => {
                const details = JSON.parse(e.response);
                this.toastr.error(details.title, 'Error');
            }
        });
    }

    onBack(): void {
        this.router.navigate(['chats']);
    }

    onCodeRequested(): void {
        this.apiService.generateLoginCode(this.form.value.email).pipe(take(1)).subscribe(data => {
            this.isCodeRequested = true;
            this.codeValidInSeconds = data.codeValidInSeconds;
            this.codeValidTimerId = window.setInterval(() => {
                if (this.codeValidInSeconds === 0) {
                    window.clearInterval(this.codeValidTimerId);
                } else {
                    --this.codeValidInSeconds;
                }
            }, 1000);
        });
    }
}
