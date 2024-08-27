import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginByEmailComponent } from './login-by-email.component';
import { ApiService } from 'src/app/services/api.service';
import { ErrorService } from 'src/app/services/error.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { InlineCountdownStubComponent } from '../inline-countdown/inline-countdown.component.stub';

class MockRouter {
    navigate = jasmine.createSpy('navigate');
}

class MockApiService {
    loginByEmail = jasmine.createSpy('loginByEmail').and.returnValue(Promise.resolve({ token: 'fakeToken' }));
    generateLoginCode = jasmine.createSpy('generateLoginCode').and.returnValue(Promise.resolve({ codeValidInSeconds: 60 }));
}

class MockTokenStorageService {
    saveToken = jasmine.createSpy('saveToken');
    saveUser = jasmine.createSpy('saveUser');
}

class MockErrorService {
    handleError = jasmine.createSpy('handleError');
}

describe('LoginByEmailComponent', () => {
    let component: LoginByEmailComponent;
    let fixture: ComponentFixture<LoginByEmailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                LoginByEmailComponent,
                InlineCountdownStubComponent
            ],
            imports: [ReactiveFormsModule],
            providers: [
                FormBuilder,
                { provide: Router, useClass: MockRouter },
                { provide: ApiService, useClass: MockApiService },
                { provide: TokenStorageService, useClass: MockTokenStorageService },
                { provide: ErrorService, useClass: MockErrorService }
            ]
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
        const apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
        apiService.generateLoginCode.and.throwError(new Error('error'));
        component.onCodeRequested();
        expect(component.isCodeRequestInProgress).toBeFalse();
    });

    it('should call onSubmit and handle response correctly', async () => {
        component.form.setValue({ email: 'test@example.com', code: '1234' });
        await component.onSubmit();
        expect(component.isSubmitInProgress).toBeTrue();
        expect((component as any)['tokenStorage'].saveToken).toHaveBeenCalledWith('fakeToken');
        expect((component as any)['tokenStorage'].saveUser).toHaveBeenCalled();
        expect((component as any)['router'].navigate).toHaveBeenCalledWith(['chats']);
    });

    it('should handle submit error correctly', () => {
        const apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
        apiService.loginByEmail.and.throwError(new Error('error'));
        component.form.setValue({ email: 'test@example.com', code: '1234' });
        component.onSubmit();
        expect(component.isSubmitInProgress).toBeFalse();
    });

    it('should navigate to chats on back button click', () => {
        component.onBack();
        expect((component as any)['router'].navigate).toHaveBeenCalledWith(['chats']);
    });

    it('should set isCodeRequested to false when timer expires', () => {
        component.onTimerExpired();
        expect(component.isCodeRequested).toBeFalse();
    });

    it('should display the countdown timer if code is requested and valid in seconds is greater than 0', () => {
        component.isCodeRequested = true;
        component.codeValidInSeconds = 60;
        fixture.detectChanges();

        const countdownElement = fixture.nativeElement.querySelector('app-inline-countdown');
        expect(countdownElement).toBeTruthy();
    });
});
