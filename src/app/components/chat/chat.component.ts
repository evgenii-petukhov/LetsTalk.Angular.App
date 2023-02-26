import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Account } from '../../models/rendering/account';
import { AccountMappingService } from '../../services/account-mapping.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
    providers: [AccountMappingService]
})
export class ChatComponent implements OnInit {
  accounts: Account[];

  constructor(
    private apiService: ApiService,
    private accountMappingService: AccountMappingService
  ) {}

    ngOnInit(): void {
        this.apiService.getChats().subscribe((accounts) => {
            this.accounts = accounts.map((account) => this.accountMappingService.map(account));
        });
    }
}
