import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: false,
})
export class SidebarComponent implements OnDestroy {
    faCirclePlus = faCirclePlus;
    isChatListShown = true;
    isAccountListShown = false;
    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private activatedRoute: ActivatedRoute,
    ) {
        this.activatedRoute.queryParams
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((params) => {
                const showContacts = params['show_contacts'] === '1';
                this.isChatListShown = !showContacts;
                this.isAccountListShown = showContacts;
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
