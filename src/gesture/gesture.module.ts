import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HammerModule } from '@angular/platform-browser';
import {
  HAMMER_CONFIG_TOKEN,
  PinchPanGestureDirective,
} from './hammerjs/pinch-pan-gesture.directive';
import { HammerConfigService } from './hammerjs/hammer-config.service';

@NgModule({
  declarations: [PinchPanGestureDirective],
  imports: [CommonModule, HammerModule],
  exports: [PinchPanGestureDirective],
  providers: [
    {
      provide: HAMMER_CONFIG_TOKEN,
      useClass: HammerConfigService,
    },
  ],
})
export class GestureModule {}
