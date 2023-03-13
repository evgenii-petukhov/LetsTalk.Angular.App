import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { createMap } from '@automapper/core';
import { AccountDto, MessageDto } from './app/api-client/api-client';

import { AppModule } from './app/app.module';
import { mapper } from './app/mapping/mapper';
import { Message } from './app/models/message';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

createMap(mapper, MessageDto, Message);