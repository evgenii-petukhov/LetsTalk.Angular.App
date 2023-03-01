import { Component, Input } from '@angular/core';
import { Account } from 'src/app/models/rendering/account';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { TokenStorageService } from 'src/app/services/token-storage.service';

@Component({
    selector: 'app-logged-in-user',
    templateUrl: './logged-in-user.component.html',
    styleUrls: ['./logged-in-user.component.scss']
})
export class LoggedInUserComponent {
    @Input() account: Account;
    faRightFromBracket = faRightFromBracket;

    constructor(private tokenStorageService: TokenStorageService) { }

    logout() {
        this.tokenStorageService.signOut();
        window.location.reload();
        return false;
    }
}
