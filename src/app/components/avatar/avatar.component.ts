import { Component, Input, OnInit } from '@angular/core';
import { IAccountDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {
    @Input() account: IAccountDto;
    photoUrl: string;

    ngOnInit(): void {
        this.photoUrl = this.account.photoUrl ?? 'images/empty-avatar.svg';
    }
}
