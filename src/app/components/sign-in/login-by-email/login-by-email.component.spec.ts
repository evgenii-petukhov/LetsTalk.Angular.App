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

        fixture = TestBed.createComponent(LoginByEmailComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should have a form with email and code controls', () => {
        // Arrange

        // Act

        // Assert
        expect(component.form.contains('email')).toBeTrue();
        expect(component.form.contains('code')).toBeTrue();
    });

    it('should make the email control required and validate email format', () => {
        // Arrange
        const emailControl = component.form.get('email');

        // Act
        emailControl.setValue('');

        // Assert
        expect(emailControl.valid).toBeFalse();

        // Act
        emailControl.setValue('test@example.com');

        // Assert
        expect(emailControl.valid).toBeTrue();
    });

    it('should make the code control required and validate code format', () => {
        // Arrange
        const codeControl = component.form.get('code');

        // Act
        codeControl.setValue('');

        // Assert
        expect(codeControl.valid).toBeFalse();

        // Act
        codeControl.setValue('1234');

        // Assert
        expect(codeControl.valid).toBeTrue();
    });

    it('should call onSubmit and handle code request correctly', async () => {
        // Arrange
        component.form.setValue({ email: 'test@example.com', code: '' });

        // Act
        await component.onSubmit();

        // Assert
        expect(apiService.generateLoginCode).toHaveBeenCalledWith('test@example.com');
        expect(component.isCodeRequested).toBeTrue();
        expect(component.isCodeRequestInProgress).toBeFalse();
        expect(component.codeValidInSeconds).toBe(60);
    });

    it('should handle code request error correctly', async () => {
        // Arrange
        apiService.generateLoginCode.and.rejectWith(new Error('error'));
        component.form.setValue({ email: 'test@example.com', code: '' });

        // Act
        await component.onSubmit();

        // Assert
        expect(errorService.handleError).toHaveBeenCalled();
        expect(component.isCodeRequestInProgress).toBeFalse();
    });

    it('should call submit and handle login response correctly', async () => {
        // Arrange
        component.form.setValue({ email: 'test@example.com', code: '1234' });
        router.navigate.and.resolveTo(true);

        // Act
        await component.onSubmit();

        // Assert
        expect(apiService.loginByEmail).toHaveBeenCalledWith('test@example.com', 1234);
        expect(tokenStorageService.saveToken).toHaveBeenCalledWith('fakeToken');
        expect(router.navigate).toHaveBeenCalledWith(['chats']);
        expect(component.isSubmitInProgress).toBeFalse();
    });

    it('should handle submit error correctly', async () => {
        // Arrange
        apiService.loginByEmail.and.rejectWith(new Error('error'));
        component.form.setValue({ email: 'test@example.com', code: '1234' });

        // Act
        await component.onSubmit();

        // Assert
        expect(errorService.handleError).toHaveBeenCalled();
        expect(component.isSubmitInProgress).toBeFalse();
    });

    it('should navigate to chats on back button click', async () => {
        // Arrange
        router.navigate.and.resolveTo(true);

        // Act
        await component.onBack();

        // Assert
        expect(router.navigate).toHaveBeenCalledWith(['chats']);
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

    it('should call onSubmit when the code is valid and form is valid', () => {
        // Arrange
        spyOn(component, 'onSubmit');
        component.form.get('email').setValue('test@example.com');
        component.form.get('code').setValue('1234');

        // Act
        component.onCodeChange();

        // Assert
        expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should call onSubmit when valid code is entered and form is valid (input event raised)', () => {
        // Arrange
        spyOn(component, 'onSubmit');
        component.isCodeRequested = true;
        component.form.get('email').setValue('test@example.com');
        fixture.detectChanges();

        const codeInput = fixture.nativeElement.querySelector('#code');

        // Act
        codeInput.value = '1234';
        codeInput.dispatchEvent(new Event('input'));

        // Assert
        expect(component.onSubmit).toHaveBeenCalled();
    });
});
