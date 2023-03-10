import { Component, OnInit } from '@angular/core';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/services/api.service';
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
    account$ = this.store.select(selectLoggedInUser);

    constructor(
        private tokenStorageService: TokenStorageService,
        private apiService: ApiService,
        private store: Store,
        private storeService: StoreService
    ) { }

    ngOnInit(): void {
        this.apiService.getMe().subscribe(account => {
            this.storeService.setLoggedInUser(account);
        });
    }

    logout() {
        this.tokenStorageService.signOut();
        window.location.reload();
        return false;
    }
}
