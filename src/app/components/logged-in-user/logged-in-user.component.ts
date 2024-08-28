import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { faRightFromBracket, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { StoreService } from 'src/app/services/store.service';
import { IProfileDto } from 'src/app/api-client/api-client';

@Component({
    selector: 'app-logged-in-user',
    templateUrl: './logged-in-user.component.html',
    styleUrls: ['./logged-in-user.component.scss']
})
export class LoggedInUserComponent implements OnInit {
    faRightFromBracket = faRightFromBracket;
    faChevronLeft = faChevronLeft;
    account: IProfileDto;
    @Output() backButtonClicked = new EventEmitter();
    @Input() @HostBinding('class.navigation-active') isNavigationActive: boolean = false;

    constructor(
        private storeService: StoreService
    ) { }

    async ngOnInit(): Promise<void> {
        this.account = await this.storeService.getLoggedInUser();
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
