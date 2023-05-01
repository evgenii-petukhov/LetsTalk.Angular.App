import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { StoreService } from 'src/app/services/store.service';
import { ApiService } from 'src/app/services/api.service';

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
        email: ['', Validators.email]
    });

    constructor(
        private location: Location,
        private fb: FormBuilder,
        private storeService: StoreService,
        private apiService: ApiService) { }

    ngOnInit(): void {
        this.storeService.loadLoggedInUser().then(account => {
            this.form.setValue({
                firstName: account.firstName,
                lastName: account.lastName,
                email: account.email
            });
        });
    }

    onSubmit(): void {
        this.storeService.setLoggedInUser({
            firstName: this.form.value.firstName,
            lastName: this.form.value.lastName,
            email: this.form.value.email
        });

        this.apiService.saveProfile(this.form.value.firstName, this.form.value.lastName, this.form.value.email).subscribe();
        this.location.back();
    }

    onBack(): void {
        this.location.back();
    }
}
