import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { errorMessages } from 'src/app/constants/errors';
import { ApiService } from 'src/app/services/api.service';
import { ErrorService } from 'src/app/services/error.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';

@Component({
    selector: 'app-login-by-email',
    templateUrl: './login-by-email.component.html',
    styleUrl: './login-by-email.component.scss',
})
export class LoginByEmailComponent {

    form = this.fb.group({
        email: ['', [Validators.email, Validators.required]],
        code: ['', [Validators.pattern('\\s*\\d{4}\\s*'), Validators.required]]
    });

    isCodeRequested = false;
    isCodeRequestInProgress = false;
    isSubmitInProgress = false;
    codeValidInSeconds = 0;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private apiService: ApiService,
        private tokenStorage: TokenStorageService,
        private errorService: ErrorService) { }

    async onSubmit(): Promise<void> {
        this.isSubmitInProgress = true;
        try {
            const loginResponseDto = await this.apiService.loginByEmail(this.form.value.email, Number(this.form.value.code));
            this.tokenStorage.saveToken(loginResponseDto.token);
            this.tokenStorage.saveUser(loginResponseDto);
            await this.router.navigate(['chats']);
        }
        catch (e) {
            this.errorService.handleError(e, errorMessages.generateCode);
        }
        finally {
            this.isSubmitInProgress = false;
        }
    }

    async onBack(): Promise<void> {
        await this.router.navigate(['chats']);
    }

    async onCodeRequested(): Promise<void> {
        this.isCodeRequestInProgress = true;
        try {
            const data = await this.apiService.generateLoginCode(this.form.value.email);
            this.isCodeRequested = true;
            this.isCodeRequestInProgress = false;
            this.codeValidInSeconds = data.codeValidInSeconds;
        }
        catch (e) {
            this.errorService.handleError(e, errorMessages.generateCode);
            this.isCodeRequestInProgress = false;
        }
    }

    onTimerExpired(): void {
        this.isCodeRequested = false;
    }

    onCodeChange(): void {
        if (this.form.valid) {
            this.onSubmit();
        }
    }
}
