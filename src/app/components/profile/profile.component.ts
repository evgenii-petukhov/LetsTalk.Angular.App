import { Component, OnInit } from '@angular/core';
import { User } from '../../models/rendering/user';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    model = new User();

    ngOnInit(): void {

    }

    onSubmit(): void {

    }
}
