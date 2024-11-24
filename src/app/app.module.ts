import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GestureModule } from '../gesture/gesture.module';
import { DrawingComponent } from './drawing/drawing.component';

@NgModule({
  declarations: [AppComponent, DrawingComponent],
  imports: [CommonModule, BrowserModule, GestureModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
