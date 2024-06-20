import { HammerGestureConfig } from '@angular/platform-browser';

export class HammerConfigService extends HammerGestureConfig {
  override = {
    pinch: { enable: true, pointers: 2, threshold: 0.1 },
    pan: {
      pointers: 3,
      threshold: 100,
    },
  };
}
