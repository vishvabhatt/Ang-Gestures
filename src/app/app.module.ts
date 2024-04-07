import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { HammerjsDirective } from './approch-2/hammerjs.directive';
import { PinchZoomDirective } from './approch-3/pinch-zoom.directive';

@NgModule({
  declarations: [AppComponent, HammerjsDirective, PinchZoomDirective],
  imports: [CommonModule, BrowserModule, HammerModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
