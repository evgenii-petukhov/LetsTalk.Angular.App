import { Component, OnInit } from '@angular/core';
import { UserMappingService } from 'src/app/services/user-mapping.service';
import { User } from '../../models/rendering/user';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    model = new User();

    constructor(
        private apiService: ApiService,
        private userMappingService: UserMappingService,
    ) {}

    ngOnInit(): void {
        this.apiService.getUser().subscribe((user) => {
            this.model = this.userMappingService.map(user);
        });
    }

    onSubmit(): void {

    }
}
