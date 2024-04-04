import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanZoomDirective } from './pan-zoom/pan-zoom.directive';
import { HammerModule } from '@angular/platform-browser';

@NgModule({
  declarations: [PanZoomDirective],
  imports: [CommonModule, HammerModule],
  exports: [PanZoomDirective],
})
export class GestureModule {}
