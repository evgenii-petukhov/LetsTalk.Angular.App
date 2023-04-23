import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    constructor(private location: Location) {}

    ngOnInit(): void {

    }

    onSubmit(): void {

    }

    onBack(): void {
        this.location.back();
    }
}
