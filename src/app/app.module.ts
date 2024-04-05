import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { PinchZoomComponent } from './pinch-zoom/pinch-zoom.component';

@NgModule({
  declarations: [AppComponent, PinchZoomComponent],
  imports: [CommonModule, BrowserModule, HammerModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
