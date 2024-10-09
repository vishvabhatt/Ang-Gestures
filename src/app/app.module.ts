import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GestureDirective } from './gesture-directive/zoom-pan.directive';

@NgModule({
  declarations: [AppComponent, GestureDirective],
  imports: [CommonModule, BrowserModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
