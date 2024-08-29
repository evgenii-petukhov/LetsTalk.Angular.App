import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StoreService } from 'src/app/services/store.service';
import { ApiService } from 'src/app/services/api.service';
import { ErrorService } from 'src/app/services/error.service';
import { UploadImageResponse } from 'src/app/protos/file_upload_pb';
import { IProfileDto, ProfileDto } from 'src/app/api-client/api-client';
import { provideMockStore } from '@ngrx/store/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AvatarStubComponent } from '../avatar/avatar.stub';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ProfileComponent', () => {
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let storeService: jasmine.SpyObj<StoreService>;
    let apiService: jasmine.SpyObj<ApiService>;
    let router: jasmine.SpyObj<Router>;
    let imageUploadService: jasmine.SpyObj<ImageUploadService>;
    let errorService: jasmine.SpyObj<ErrorService>;

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', ['getLoggedInUser', 'setLoggedInUser']);
        storeService.getLoggedInUser.and.returnValue(Promise.resolve({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
        } as IProfileDto));
        apiService = jasmine.createSpyObj('ApiService', ['saveProfile']);
        router = jasmine.createSpyObj('Router', ['navigate']);
        imageUploadService = jasmine.createSpyObj('ImageUploadService', ['resizeAndUploadImage']);
        errorService = jasmine.createSpyObj('ErrorService', ['handleError']);

        await TestBed.configureTestingModule({
            declarations: [ProfileComponent, AvatarStubComponent],
            imports: [ReactiveFormsModule, FontAwesomeModule],
            providers: [
                FormBuilder,
                provideMockStore({}),
                { provide: StoreService, useValue: storeService },
                { provide: ApiService, useValue: apiService },
                { provide: Router, useValue: router },
                { provide: ImageUploadService, useValue: imageUploadService },
                { provide: ErrorService, useValue: errorService }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form with the logged-in user data', async () => {
        const mockAccount = { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' };
        storeService.getLoggedInUser.and.returnValue(Promise.resolve(mockAccount));

        await component.ngOnInit();

        expect(component.form.value).toEqual({
            firstName: 'John',
            lastName: 'Doe',
            photoUrl: null
        });
        expect(component.email).toBe('john.doe@example.com');
    });

    it('should navigate back to chats on onBack call', () => {
        component.onBack();
        expect(router.navigate).toHaveBeenCalledWith(['chats']);
    });

    it('should handle avatar selection and set the photoUrl in the form', async () => {
        const mockFile = new File([''], 'avatar.png', { type: 'image/png' });
        const event = { target: { files: [mockFile] } } as any;
        spyOn(mockFile, 'arrayBuffer').and.returnValue(Promise.resolve(new ArrayBuffer(8)));

        await component.onAvatarSelected(event);

        expect(component.form.value.photoUrl).not.toBeNull();
    });

    it('should submit the form and navigate to chats on success', async () => {
        component.form.setValue({ firstName: 'John', lastName: 'Doe', photoUrl: 'mockBase64Url' });
        const mockUploadResponse = new UploadImageResponse();
        const mockProfileDto = new ProfileDto();

        imageUploadService.resizeAndUploadImage.and.returnValue(Promise.resolve(mockUploadResponse));
        apiService.saveProfile.and.returnValue(Promise.resolve(mockProfileDto));

        await component.onSubmit();

        expect(component.isSending).toBeFalse();
        expect(storeService.setLoggedInUser).toHaveBeenCalledWith(mockProfileDto);
        expect(router.navigate).toHaveBeenCalledWith(['chats']);
    });

    it('should handle errors on form submission', async () => {
        component.form.setValue({ firstName: 'John', lastName: 'Doe', photoUrl: 'mockBase64Url' });

        imageUploadService.resizeAndUploadImage.and.throwError(new Error('error'));

        await component.onSubmit();

        expect(component.isSending).toBeFalse();
    });

    it('should revoke object URL on destroy', () => {
        spyOn(URL, 'revokeObjectURL');

        component.ngOnDestroy();

        expect(URL.revokeObjectURL).toHaveBeenCalledWith(component.form.value.photoUrl);
    });
});
