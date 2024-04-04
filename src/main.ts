import { AppModule } from './app/app.module';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'hammerjs';
import 'zone.js';
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err: unknown) => console.error(err));
