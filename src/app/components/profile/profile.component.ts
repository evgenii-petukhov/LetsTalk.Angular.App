import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StoreService } from 'src/app/services/store.service';
import { ApiService } from 'src/app/services/api.service';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { selectLoggedInUser } from 'src/app/state/logged-in-user/logged-in-user.selectors';
import { Store } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import { ImageRoles, UploadImageResponse } from 'src/app/protos/file_upload_pb';
import { ErrorService } from 'src/app/services/error.service';
import { errorMessages } from 'src/app/constants/errors';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { Location } from '@angular/common';

// https://angular.io/guide/reactive-forms
// https://angular.io/guide/form-validation
// https://www.pluralsight.com/guides/how-to-display-validation-messages-using-angular
// https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page/
@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: false,
})
export class ProfileComponent implements OnInit, OnDestroy {
    account$ = this.store.select(selectLoggedInUser);
    isSending = false;
    email = '';

    form = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        photoUrl: [null],
    });
    faUpload = faUpload;

    constructor(
        private fb: FormBuilder,
        private storeService: StoreService,
        private apiService: ApiService,
        private store: Store,
        private imageUploadService: ImageUploadService,
        private errorService: ErrorService,
        private location: Location,
    ) {}

    async ngOnInit(): Promise<void> {
        const account = await this.storeService.getLoggedInUser();

        this.form.setValue({
            firstName: account.firstName,
            lastName: account.lastName,
            photoUrl: null,
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
            const image = this.form.value.photoUrl
                ? await this.imageUploadService.resizeAndUploadImage(
                      this.form.value.photoUrl,
                      sizeLimits.width,
                      sizeLimits.height,
                      ImageRoles.AVATAR,
                  )
                : null;
            await this.submitForm(image);
        } catch (e) {
            this.handleSubmitError(e, errorMessages.uploadImage);
        }
    }

    async onBack(): Promise<void> {
        this.location.back();
    }

    async onAvatarSelected(event: Event): Promise<void> {
        const files = (event.target as HTMLInputElement).files;

        if (files && files.length) {
            const buffer = await files[0].arrayBuffer();
            const base64 = URL.createObjectURL(new Blob([buffer]));
            this.form.patchValue({
                photoUrl: base64,
            });
        }
    }

    private async submitForm(image: UploadImageResponse): Promise<void> {
        try {
            const profileDto = await this.apiService.saveProfile(
                this.form.value.firstName,
                this.form.value.lastName,
                image,
            );
            this.storeService.setLoggedInUser(profileDto);
            this.location.back();
            this.isSending = false;
        } catch (e) {
            this.handleSubmitError(e, errorMessages.saveProfile);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private handleSubmitError(e: any, defaultMessage: string) {
        this.errorService.handleError(e, defaultMessage);
        this.isSending = false;
    }
}
