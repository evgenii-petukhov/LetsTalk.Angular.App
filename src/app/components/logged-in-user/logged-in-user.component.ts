import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { faRightFromBracket, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { selectLoggedInUser } from 'src/app/state/logged-in-user/logged-in-user.selectors';
import { StoreService } from 'src/app/services/store.service';

@Component({
    selector: 'app-logged-in-user',
    templateUrl: './logged-in-user.component.html',
    styleUrls: ['./logged-in-user.component.scss']
})
export class LoggedInUserComponent implements OnInit {
    faRightFromBracket = faRightFromBracket;
    faChevronLeft = faChevronLeft;
    account$ = this.store.select(selectLoggedInUser);
    @Output() backButtonClicked = new EventEmitter();
    @Input() @HostBinding('class.navigation-active') isNavigationActive: boolean = false;

    constructor(
        private store: Store,
        private storeService: StoreService
    ) { }

    ngOnInit(): void {
        this.storeService.getLoggedInUser();
    }

    logout(): boolean {
        window.localStorage.clear();
        window.location.reload();
        return false;
    }

    onBackButtonClicked(): boolean {
        this.backButtonClicked.emit();
        return false;
    }
}
