import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StoreService } from 'src/app/services/store.service';
import { ApiService } from 'src/app/services/api.service';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { selectLoggedInUser } from 'src/app/state/logged-in-user/logged-in-user.selectors';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ImageRoles, UploadImageResponse } from 'src/app/protos/file_upload_pb';
import { ErrorService } from 'src/app/services/error.service';
import { errorMessages } from 'src/app/constants/errors';
import { ImageUploadService } from 'src/app/services/image-upload.service';

// https://angular.io/guide/reactive-forms
// https://angular.io/guide/form-validation
// https://www.pluralsight.com/guides/how-to-display-validation-messages-using-angular
// https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page/
@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
    account$ = this.store.select(selectLoggedInUser);
    isSending = false;
    email = '';

    form = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        photoUrl: [null]
    });
    faUpload = faUpload;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private storeService: StoreService,
        private apiService: ApiService,
        private store: Store,
        private imageUploadService: ImageUploadService,
        private errorService: ErrorService) { }

    async ngOnInit(): Promise<void> {
        const account = await this.storeService.getLoggedInUser();

        this.form.setValue({
            firstName: account.firstName,
            lastName: account.lastName,
            photoUrl: null
        });
        this.email = account.email;
    }

    ngOnDestroy(): void {
        URL.revokeObjectURL(this.form.value.photoUrl);
    }

    async onSubmit(): Promise<void> {
        this.isSending = true;
        const sizeLimits = environment.imageSettings.limits.avatar;
        try {
            const response = await this.imageUploadService.resizeAndUploadImage(this.form.value.photoUrl, sizeLimits.width, sizeLimits.height, ImageRoles.AVATAR);
            await this.submitForm(response);
        }
        catch (e) {
            this.handleSubmitError(e, errorMessages.uploadImage);
        }
    }

    async onBack(): Promise<void> {
        await this.router.navigate(['chats']);
    }

    async onAvatarSelected(event: Event): Promise<void> {
        const files = (event.target as HTMLInputElement).files;

        if (files && files.length) {
            const buffer = await files[0].arrayBuffer();
            const base64 = URL.createObjectURL(new Blob([buffer]));
            this.form.patchValue({
                photoUrl: base64
            });
        }
    }

    private async submitForm(response: UploadImageResponse): Promise<void> {
        try {
            const profileDto = await this.apiService.saveProfile(
                this.form.value.firstName, this.form.value.lastName, response);
            this.storeService.setLoggedInUser(profileDto);
            await this.router.navigate(['chats']);
            this.isSending = false;
        }
        catch (e) {
            this.handleSubmitError(e, errorMessages.saveProfile);
        }
    }

    private handleSubmitError(e: any, defaultMessage: string) {
        this.errorService.handleError(e, defaultMessage);
        this.isSending = false;
    }
}
