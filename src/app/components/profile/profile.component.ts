import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

// validation: https://www.pluralsight.com/guides/how-to-display-validation-messages-using-angular
// navigate back: https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page/
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
        private apiService: ApiService,
        private fb: FormBuilder) { }

    ngOnInit(): void {
        this.apiService.getMe().subscribe(account => {
            this.form.setValue({
                firstName: account.firstName,
                lastName: account.lastName,
                email: ''
            });
        });
    }

    onSubmit(): void {

    }

    onBack(): void {
        this.location.back();
    }
}
