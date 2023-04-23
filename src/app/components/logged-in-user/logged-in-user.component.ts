import { Component, OnInit } from '@angular/core';
import { faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { selectLoggedInUser } from 'src/app/state/logged-in-user/logged-in-user.selectors';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-logged-in-user',
    templateUrl: './logged-in-user.component.html',
    styleUrls: ['./logged-in-user.component.scss']
})
export class LoggedInUserComponent implements OnInit {
    faRightFromBracket = faRightFromBracket;
    faUser = faUser;
    account$ = this.store.select(selectLoggedInUser);

    constructor(
        private tokenStorageService: TokenStorageService,
        private store: Store,
        private storeService: StoreService
    ) { }

    ngOnInit(): void {
        this.storeService.loadLoggedInUser();
    }

    logout() {
        this.tokenStorageService.signOut();
        window.location.reload();
        return false;
    }
}
