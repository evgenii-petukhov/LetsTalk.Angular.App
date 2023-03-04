import { Component, OnInit } from '@angular/core';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/services/api.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { selectLoggedInUser } from 'src/app/state/logged-in-user/select-selected-account-id.selectors';
import { LoggedInUserActions } from 'src/app/state/logged-in-user/selected-account-id.actions';

@Component({
    selector: 'app-logged-in-user',
    templateUrl: './logged-in-user.component.html',
    styleUrls: ['./logged-in-user.component.scss']
})
export class LoggedInUserComponent implements OnInit {
    faRightFromBracket = faRightFromBracket;
    account$ = this.store.select(selectLoggedInUser);

    constructor(
        private tokenStorageService: TokenStorageService,
        private apiService: ApiService,
        private store: Store
    ) { }

    ngOnInit(): void {
        this.apiService.getMe().subscribe(account => {
            this.store.dispatch(LoggedInUserActions.init({
                account: account
            }));
        });
    }

    logout() {
        this.tokenStorageService.signOut();
        window.location.reload();
        return false;
    }
}
