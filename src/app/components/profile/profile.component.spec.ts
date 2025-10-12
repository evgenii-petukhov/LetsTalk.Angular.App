import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StoreService } from 'src/app/services/store.service';
import { ApiService } from 'src/app/services/api.service';
import { ErrorService } from 'src/app/services/error.service';
import { ImageRoles, UploadImageResponse } from 'src/app/protos/file_upload_pb';
import { ProfileDto } from 'src/app/api-client/api-client';
import { provideMockStore } from '@ngrx/store/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AvatarStubComponent } from '../shared/avatar/avatar.component.stub';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { errorMessages } from 'src/app/constants/errors';

describe('ProfileComponent', () => {
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let storeService: jasmine.SpyObj<StoreService>;
    let apiService: jasmine.SpyObj<ApiService>;
    let router: jasmine.SpyObj<Router>;
    let imageUploadService: jasmine.SpyObj<ImageUploadService>;
    let errorService: jasmine.SpyObj<ErrorService>;

    beforeEach(async () => {
        storeService = jasmine.createSpyObj('StoreService', [
            'getLoggedInUser',
            'setLoggedInUser',
        ]);
        apiService = jasmine.createSpyObj('ApiService', ['saveProfile']);
        router = jasmine.createSpyObj('Router', ['navigate']);
        imageUploadService = jasmine.createSpyObj('ImageUploadService', [
            'resizeAndUploadImage',
        ]);
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
                { provide: ErrorService, useValue: errorService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form with the logged-in user data', async () => {
        // Arrange
        const account = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
        };
        storeService.getLoggedInUser.and.resolveTo(account);

        // Act
        await component.ngOnInit();

        // Assert
        expect(component.form.value).toEqual({
            firstName: 'John',
            lastName: 'Doe',
            photoUrl: null,
        });
        expect(component.email).toBe('john.doe@example.com');
    });

    it('should navigate back to chats on onBack call', () => {
        // Arrange

        // Act
        component.onBack();

        // Assert
        expect(router.navigate).toHaveBeenCalledWith(['chats']);
    });

    it('should handle avatar selection and set the photoUrl in the form', async () => {
        // Arrange
        const file = new File([''], 'avatar.png', { type: 'image/png' });

        spyOn(file, 'arrayBuffer').and.resolveTo(new ArrayBuffer(8));

        // Act
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await component.onAvatarSelected({ target: { files: [file] } } as any);

        // Assert
        expect(component.form.value.photoUrl).not.toBeNull();
    });

    it('should submit the form and navigate to chats on success', async () => {
        // Arrange
        component.form.setValue({
            firstName: 'John',
            lastName: 'Doe',
            photoUrl: 'mockBase64Url',
        });

        const uploadResponse = new UploadImageResponse();
        imageUploadService.resizeAndUploadImage.and.resolveTo(uploadResponse);

        const profile = new ProfileDto();
        apiService.saveProfile.and.resolveTo(profile);

        // Act
        await component.onSubmit();

        // Assert
        expect(
            imageUploadService.resizeAndUploadImage,
        ).toHaveBeenCalledOnceWith(
            'mockBase64Url',
            512,
            512,
            ImageRoles.AVATAR,
        );
        expect(errorService.handleError).not.toHaveBeenCalled();
        expect(component.isSending).toBeFalse();
        expect(apiService.saveProfile).toHaveBeenCalledOnceWith(
            'John',
            'Doe',
            uploadResponse,
        );
        expect(storeService.setLoggedInUser).toHaveBeenCalledWith(profile);
        expect(router.navigate).toHaveBeenCalledWith(['chats']);
    });

    it('should handle errors on image uploading', async () => {
        // Arrange
        component.form.setValue({
            firstName: 'John',
            lastName: 'Doe',
            photoUrl: 'mockBase64Url',
        });

        const error = new Error('error');
        imageUploadService.resizeAndUploadImage.and.throwError(error);

        // Act
        await component.onSubmit();

        // Assert
        expect(component.isSending).toBeFalse();
        expect(errorService.handleError).toHaveBeenCalledOnceWith(
            error,
            errorMessages.uploadImage,
        );
        expect(apiService.saveProfile).not.toHaveBeenCalled();
        expect(storeService.setLoggedInUser).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle errors on form submission', async () => {
        // Arrange
        component.form.setValue({
            firstName: 'John',
            lastName: 'Doe',
            photoUrl: 'mockBase64Url',
        });

        const uploadResponse = new UploadImageResponse();
        imageUploadService.resizeAndUploadImage.and.resolveTo(uploadResponse);

        const error = new Error('error');
        apiService.saveProfile.and.throwError(error);

        // Act
        await component.onSubmit();

        // Assert
        expect(
            imageUploadService.resizeAndUploadImage,
        ).toHaveBeenCalledOnceWith(
            'mockBase64Url',
            512,
            512,
            ImageRoles.AVATAR,
        );
        expect(component.isSending).toBeFalse();
        expect(apiService.saveProfile).toHaveBeenCalledOnceWith(
            'John',
            'Doe',
            uploadResponse,
        );
        expect(errorService.handleError).toHaveBeenCalledOnceWith(
            error,
            errorMessages.saveProfile,
        );
        expect(storeService.setLoggedInUser).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should revoke object URL on destroy', () => {
        // Arrange
        spyOn(URL, 'revokeObjectURL');

        // Act
        component.ngOnDestroy();

        // Assert
        expect(URL.revokeObjectURL).toHaveBeenCalledWith(
            component.form.value.photoUrl,
        );
    });
});
