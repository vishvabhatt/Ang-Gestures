import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HammerModule } from '@angular/platform-browser';
import {
  HammerConfigService,
  HAMMER_CONFIG_TOKEN,
  MultipleGestureDirective,
} from './multiple-gesture.directive';

@NgModule({
  declarations: [MultipleGestureDirective],
  imports: [CommonModule, HammerModule],
  exports: [MultipleGestureDirective],
  providers: [
    {
      provide: HAMMER_CONFIG_TOKEN,
      useClass: HammerConfigService,
    },
  ],
})
export class GestureModule {}
