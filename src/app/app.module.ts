import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';

@NgModule({
  declarations: [AppComponent],
  imports: [CommonModule, BrowserModule, HammerModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
