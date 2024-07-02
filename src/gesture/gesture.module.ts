import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HammerModule } from '@angular/platform-browser';
import {
  HAMMER_CONFIG_TOKEN,
  PinchPanGestureDirective,
} from './hammerjs/pinch-pan-gesture.directive';
import { HammerConfigService } from './hammerjs/hammer-config.service';
import { PinchPanInfractDirective } from './interactjs/pinch-pan-intract.directive';

@NgModule({
  declarations: [PinchPanGestureDirective, PinchPanInfractDirective],
  imports: [CommonModule, HammerModule],
  exports: [PinchPanGestureDirective, PinchPanInfractDirective],
  providers: [
    {
      provide: HAMMER_CONFIG_TOKEN,
      useClass: HammerConfigService,
    },
  ],
})
export class GestureModule {}
