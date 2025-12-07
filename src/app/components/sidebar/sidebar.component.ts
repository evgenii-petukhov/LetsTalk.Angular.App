import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    standalone: false,
})
export class SidebarComponent implements OnInit, OnDestroy {
    faCirclePlus = faCirclePlus;
    isChatListShown = true;
    isAccountListShown = false;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store,
        private storeService: StoreService,
        private activatedRoute: ActivatedRoute,
    ) {
        this.activatedRoute.queryParams
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((params) => {
                const showContacts = params['show_contacts'] === '1';
                this.storeService.setLayoutSettings({
                    sidebarState: showContacts
                        ? SidebarState.accounts
                        : SidebarState.chats,
                });
            });
    }

    ngOnInit(): void {
        this.store
            .select(selectLayoutSettings)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((layout) => {
                this.isChatListShown =
                    layout.sidebarState === SidebarState.chats;
                this.isAccountListShown =
                    layout.sidebarState === SidebarState.accounts;
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
