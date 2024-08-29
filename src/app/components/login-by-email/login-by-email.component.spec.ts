/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginByEmailComponent } from './login-by-email.component';
import { ApiService } from 'src/app/services/api.service';
import { ErrorService } from 'src/app/services/error.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { InlineCountdownStubComponent } from '../inline-countdown/inline-countdown.component.stub';
import {
    GenerateLoginCodeResponseDto,
    LoginResponseDto,
} from 'src/app/api-client/api-client';

describe('LoginByEmailComponent', () => {
    let component: LoginByEmailComponent;
    let fixture: ComponentFixture<LoginByEmailComponent>;
    let apiService: jasmine.SpyObj<ApiService>;
    let tokenStorageService: jasmine.SpyObj<TokenStorageService>;
    let errorService: jasmine.SpyObj<ErrorService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        apiService = jasmine.createSpyObj('ApiService', [
            'loginByEmail',
            'generateLoginCode',
        ]);
        apiService.loginByEmail.and.resolveTo(
            new LoginResponseDto({ token: 'fakeToken' }),
        );
        apiService.generateLoginCode.and.resolveTo(
            new GenerateLoginCodeResponseDto({ codeValidInSeconds: 60 }),
        );
        tokenStorageService = jasmine.createSpyObj('TokenStorageService', [
            'saveToken',
            'saveUser',
        ]);
        errorService = jasmine.createSpyObj('ErrorService', ['handleError']);
        router = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [LoginByEmailComponent, InlineCountdownStubComponent],
            imports: [ReactiveFormsModule],
            providers: [
                FormBuilder,
                { provide: Router, useValue: router },
                { provide: ApiService, useValue: apiService },
                { provide: TokenStorageService, useValue: tokenStorageService },
                { provide: ErrorService, useValue: errorService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginByEmailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should have a form with email and code controls', () => {
        expect(component.form.contains('email')).toBeTrue();
        expect(component.form.contains('code')).toBeTrue();
    });

    it('should make the email control required and validate email format', () => {
        const emailControl = component.form.get('email');
        emailControl.setValue('');
        expect(emailControl.valid).toBeFalse();
        emailControl.setValue('test@example.com');
        expect(emailControl.valid).toBeTrue();
    });

    it('should make the code control required and validate code format', () => {
        const codeControl = component.form.get('code');
        codeControl.setValue('');
        expect(codeControl.valid).toBeFalse();
        codeControl.setValue('1234');
        expect(codeControl.valid).toBeTrue();
    });

    it('should call onCodeRequested and handle response correctly', async () => {
        await component.onCodeRequested();
        expect(component.isCodeRequested).toBeTrue();
        expect(component.isCodeRequestInProgress).toBeFalse();
        expect(component.codeValidInSeconds).toBe(60);
    });

    it('should handle code request error correctly', () => {
        apiService.generateLoginCode.and.throwError(new Error('error'));
        component.onCodeRequested();
        expect(component.isCodeRequestInProgress).toBeFalse();
    });

    it('should call onSubmit and handle response correctly', async () => {
        // Arrange
        component.form.setValue({ email: 'test@example.com', code: '1234' });

        // Act
        await component.onSubmit();

        // Assert
        expect(component.isSubmitInProgress).toBeFalse();
        expect(
            (component as any)['tokenStorage'].saveToken,
        ).toHaveBeenCalledWith('fakeToken');
        expect((component as any)['tokenStorage'].saveUser).toHaveBeenCalled();

        expect((component as any)['router'].navigate).toHaveBeenCalledWith([
            'chats',
        ]);
    });

    it('should handle submit error correctly', () => {
        apiService.loginByEmail.and.throwError(new Error('error'));
        component.form.setValue({ email: 'test@example.com', code: '1234' });
        component.onSubmit();
        expect(component.isSubmitInProgress).toBeFalse();
    });

    it('should navigate to chats on back button click', () => {
        // Arrange

        // Act
        component.onBack();

        // Assert
        expect((component as any)['router'].navigate).toHaveBeenCalledWith([
            'chats',
        ]);
    });

    it('should set isCodeRequested to false when timer expires', () => {
        // Arrange

        // Act
        component.onTimerExpired();

        // Assert
        expect(component.isCodeRequested).toBeFalse();
    });

    it('should display the countdown timer if code is requested and valid in seconds is greater than 0', () => {
        // Arrange

        // Act
        component.isCodeRequested = true;
        component.codeValidInSeconds = 60;
        fixture.detectChanges();

        // Assert
        const countdownElement = fixture.nativeElement.querySelector(
            'app-inline-countdown',
        );
        expect(countdownElement).toBeTruthy();
    });
});
