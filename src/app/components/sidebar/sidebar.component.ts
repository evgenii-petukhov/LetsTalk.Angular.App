import { Component, OnDestroy, OnInit } from '@angular/core';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { SidebarState } from 'src/app/enums/sidebar-state';
import { StoreService } from 'src/app/services/store.service';
import { selectLayoutSettings } from 'src/app/state/layout-settings/layout-settings.selectors';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
    faCirclePlus = faCirclePlus;
    isChatListShown = true;
    isAccountListShown = false;
    layout$ = this.store.select(selectLayoutSettings);

    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store,
        private storeService: StoreService,
    ) {}

    ngOnInit(): void {
        this.layout$.pipe(takeUntil(this.unsubscribe$)).subscribe((layout) => {
            this.isChatListShown = layout.sidebarState === SidebarState.chats;
            this.isAccountListShown =
                layout.sidebarState === SidebarState.accounts;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    switchToAccountList(): void {
        this.storeService.setLayoutSettings({
            sidebarState: SidebarState.accounts,
        });
    }

    onBackButtonClicked(): void {
        this.storeService.setLayoutSettings({
            sidebarState: SidebarState.chats,
        });
    }
}
