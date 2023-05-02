import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { StoreService } from 'src/app/services/store.service';
import { ApiService } from 'src/app/services/api.service';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { downloadAndEncodeToBase64 } from 'src/app/helpers/base64.helper';

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
    form = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', Validators.email],
        photoBase64: ['']
    });
    faUpload = faUpload;

    constructor(
        private location: Location,
        private fb: FormBuilder,
        private storeService: StoreService,
        private apiService: ApiService) { }

    ngOnInit(): void {
        this.storeService.loadLoggedInUser().then(account => {
            downloadAndEncodeToBase64(account.photoUrl).then((blob: string) => {
                this.form.setValue({
                    firstName: account.firstName,
                    lastName: account.lastName,
                    email: account.email,
                    photoBase64: blob
                });
            });
        });
    }

    onSubmit(): void {
        this.storeService.setLoggedInUser(this.form.value);
        this.apiService.saveProfile(this.form.value).subscribe(() => this.location.back());
    }

    onBack(): void {
        this.location.back();
    }

    onAvatarSelected(event: any) {
        const files = event.target.files;
        if (files && files[0]) {
            const reader = new FileReader();

            reader.onload = (e: any) => {
                this.form.value.photoBase64 = e.target.result;
            };

            reader.readAsDataURL(files[0]);
        }
    }
}
