import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Account } from '../../models/rendering/account';
import { AccountMappingService } from '../../services/account-mapping.service';

@Component({
    selector: 'app-messager',
    templateUrl: './messager.component.html',
    styleUrls: ['./messager.component.scss'],
    providers: [AccountMappingService]
})
export class MessagerComponent implements OnInit {

    accounts = new Array<Account>();

    accountId: number = null;

    constructor(
        private apiService: ApiService,
        private accountMappingService: AccountMappingService
    ) { 

    }

    ngOnInit(): void {
        this.apiService.getAccounts().subscribe((accounts) => {
            this.accounts.push(...accounts.map((account) => this.accountMappingService.map(account)));
        });
    }

    onAccountSelected(accountId: number): void {
        this.accountId = accountId;
    }
}
