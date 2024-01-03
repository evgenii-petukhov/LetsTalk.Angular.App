import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StoreService } from 'src/app/services/store.service';
import { ApiService } from 'src/app/services/api.service';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { selectLoggedInUser } from 'src/app/state/logged-in-user/logged-in-user.selectors';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ImageService } from 'src/app/services/image.service';
import { environment } from 'src/environments/environment';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { ImageRoles, UploadImageResponse } from 'src/app/protos/file_upload_pb';
import { AccountDto } from 'src/app/api-client/api-client';
import { Subject, takeUntil } from 'rxjs';

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
    private unsubscribe$: Subject<void> = new Subject<void>();

    form = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', Validators.email],
        photoUrl: [null]
    });
    faUpload = faUpload;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private storeService: StoreService,
        private apiService: ApiService,
        private store: Store,
        private toastr: ToastrService,
        private imageService: ImageService,
        private fileStorageService: FileStorageService) { }

    ngOnInit(): void {
        this.storeService.getLoggedInUser().then(account => {
            this.form.setValue({
                firstName: account.firstName,
                lastName: account.lastName,
                email: account.email,
                photoUrl: null
            });
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        URL.revokeObjectURL(this.form.value.photoUrl);
    }

    onSubmit(): void {
        this.isSending = true;
        const sizeLimits = environment.imageSettings.limits.avatar;
        this.resizeAvatar(this.form.value.photoUrl, sizeLimits.width, sizeLimits.height).then((blob: Blob) => {
            return blob ? this.fileStorageService.uploadImageAsBlob(blob, ImageRoles.AVATAR) : Promise.resolve<UploadImageResponse>(null);
        }).then(response => {
            this.submitForm(response);
        }).catch(e => {
            console.error(e);
            this.isSending = false;
        });
    }

    onBack(): void {
        this.router.navigate(['chats']);
    }

    onAvatarSelected(event: Event): void {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length) {
            files[0].arrayBuffer().then((buffer: ArrayBuffer) => {
                const base64 = URL.createObjectURL(new Blob([buffer]));
                this.form.patchValue({
                    photoUrl: base64
                });
            });
        }
    }

    private resizeAvatar(photoUrl: string, maxWidth: number, maxHeight: number): Promise<Blob> {
        return photoUrl ? this.imageService.resizeBase64Image(photoUrl, maxWidth, maxHeight) : Promise.resolve(null);
    }

    private submitForm(response: UploadImageResponse): void {
        this.apiService.saveProfile(
            this.form.value.email,
            this.form.value.firstName,
            this.form.value.lastName,
            response).pipe(takeUntil(this.unsubscribe$)).subscribe({
                next: (accountDto: AccountDto) => {
                    this.storeService.setLoggedInUser(accountDto);
                    this.router.navigate(['chats']);
                },
                error: e => {
                    const details = JSON.parse(e.response);
                    this.toastr.error(details.title, 'Error');
                }
            });
    }
}
