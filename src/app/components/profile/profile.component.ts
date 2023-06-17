import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StoreService } from 'src/app/services/store.service';
import { ApiService } from 'src/app/services/api.service';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { encodeToBase64 } from 'src/app/helpers/base64.helper';
import { selectLoggedInUser } from 'src/app/state/logged-in-user/logged-in-user.selectors';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ImageService } from 'src/app/services/image.service';
import { environment } from 'src/environments/environment';
import { FileStorageService } from 'src/app/services/file-storage.service';
import { Buffer } from 'buffer';

// https://angular.io/guide/reactive-forms
// https://angular.io/guide/form-validation
// https://www.pluralsight.com/guides/how-to-display-validation-messages-using-angular
// https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page/
@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    account$ = this.store.select(selectLoggedInUser);

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

    onSubmit(): void {
        this.resizeAvatar().then((blob) => this.submitForm(blob));
    }

    onBack(): void {
        this.router.navigate(['chats']);
    }

    onAvatarSelected(event: any): void {
        const files = event.target.files;
        if (files && files.length) {
            encodeToBase64(files[0]).then(base64 => this.form.patchValue({
                photoUrl: base64
            }));
        }
    }

    private resizeAvatar(): Promise<Uint8Array> {
        return new Promise<Uint8Array>(resolve => {
            if (this.form.value.photoUrl) {
                const env = (environment as any);
                this.imageService.resizeBase64Image(this.form.value.photoUrl, env.avatarMaxWidth, env.avatarMaxHeight).then(base64 => {
                    this.form.patchValue({
                        photoUrl: base64
                    });
                    resolve(Buffer.from(base64, 'base64'));
                });
            } else {
                resolve(null);
            }
        });
    }

    private submitForm(blob: Uint8Array): void {
        this.fileStorageService.upload(blob).then(response => {
            this.apiService.saveProfile(this.form.value).subscribe({
                next: account => {
                    this.storeService.setLoggedInUser(account);
                    this.router.navigate(['chats']);
                },
                error: e => {
                    const details = JSON.parse(e.response);
                    this.toastr.error(details.title, 'Error');
                }
            });
        });
    }
}
