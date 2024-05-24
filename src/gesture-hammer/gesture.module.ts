import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HammerModule } from '@angular/platform-browser';
import { PinchZoomDirective } from './pinch-zoom.directive';
import { PinchZoomComponent } from './pinch-zoom/pinch-zoom.component';
import { MultipleGestureDirective } from './multiple-gesture.directive';

@NgModule({
  declarations: [PinchZoomDirective, PinchZoomComponent, MultipleGestureDirective],
  imports: [CommonModule, HammerModule],
  exports: [PinchZoomDirective, PinchZoomComponent],
})
export class GestureModule {}
