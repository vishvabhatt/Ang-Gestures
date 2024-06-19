import { HammerGestureConfig } from '@angular/platform-browser';

export class HammerConfigService extends HammerGestureConfig {
  override = {
    swipe: {
      direction: Hammer.DIRECTION_HORIZONTAL,
      enable: true,
      pointers: 2,
      threshold: 10,
      velocity: 0.1,
    },
    pinch: { enable: true, pointers: 2, threshold: 0.1 },
    pan: {
      pointers: 1,
      threshold: 100,
    },
  };
}
