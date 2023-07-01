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
import { Buffer } from 'buffer';
import { Base64Service } from 'src/app/services/base64.service';
import { UploadImageResponse } from 'src/app/protos/file_upload_pb';
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
        private fileStorageService: FileStorageService,
        private base64Service: Base64Service) { }

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
    }

    onSubmit(): void {
        this.isSending = true;
        this.resizeAvatar(this.form.value.photoUrl).then(
            (base64: string) => this.uploadAvatar(base64)).then(
                () => this.submitForm()).catch(() => {
                    this.isSending = false;
                });
    }

    onBack(): void {
        this.router.navigate(['chats']);
    }

    onAvatarSelected(event: Event): void {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length) {
            this.base64Service.encodeToBase64(files[0]).then(base64 => this.form.patchValue({
                photoUrl: base64
            }));
        }
    }

    private resizeAvatar(photoUrl: string): Promise<string> {
        if (!photoUrl) {
            return Promise.resolve(null);
        }

        return new Promise<string>(resolve => {
            const env = (environment as any);
            this.imageService.resizeBase64Image(photoUrl, env.avatarMaxWidth, env.avatarMaxHeight).then(base64 => {
                this.form.patchValue({
                    photoUrl
                });
                resolve(base64);
            });
        });
    }

    private uploadAvatar(base64: string): Promise<UploadImageResponse> {
        if (!base64) {
            return Promise.resolve(null);
        }
        const content = this.base64Service.getContent(base64);
        const blob = Buffer.from(content, 'base64');
        return this.fileStorageService.upload(blob);
    }

    private submitForm(): void {
        this.apiService.saveProfile(
            this.form.value.email,
            this.form.value.firstName,
            this.form.value.lastName).pipe(takeUntil(this.unsubscribe$)).subscribe({
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
