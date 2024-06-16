import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  OnInit,
  Output,
} from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';

export const HAMMER_CONFIG_TOKEN = new InjectionToken<HammerGestureConfig>(
  'HAMMER_CONFIG_TOKEN'
);

@Directive({
  selector: '[appMultipleGesture]',
})
export class MultipleGestureDirective implements OnInit {
  private targetedElement: HTMLElement;
  private hammerManager: HammerManager;
  @Output() eventOutput = new EventEmitter<string>();
  constructor(
    elementRef: ElementRef,
    @Inject(HAMMER_CONFIG_TOKEN)
    private hammerConfigService: HammerConfigService
  ) {
    if (elementRef.nativeElement as HTMLElement) {
      this.targetedElement = elementRef.nativeElement;
      this.hammerManager = new Hammer.Manager(
        this.targetedElement,
        this.hammerConfigService.overrides
      );
    } else {
      throw new Error('No HTML element found');
    }
  }

  public ngOnInit() {
    this.configureHammerManager();
    this.listenHammerCallbacks();
  }

  private configureHammerManager() {
    const swipe = new Hammer.Swipe(this.hammerConfigService.override.swipe);
    const pinch = new Hammer.Pinch(this.hammerConfigService.override.pinch);
    const pan = new Hammer.Pan(this.hammerConfigService.override.pan);
    const press = new Hammer.Pan(this.hammerConfigService.override.press);
    this.hammerManager.add([swipe, pinch, pan, press]);
  }

  private listenHammerCallbacks() {
    this.hammerManager.on('pinchmove', (event) => {
      console.log('pinchmove', event);
      this.eventOutput.emit('pinchmove');
    });

    this.hammerManager.on('pan', (event) => {
      console.log('pan', event);
      this.eventOutput.emit('pan');
    });

    this.hammerManager.on('swipeleft', (event) => {
      console.log('swipeleft', event);
      this.eventOutput.emit('swipeleft');
    });

    this.hammerManager.on('swiperight', (event) => {
      console.log('swiperight', event);
      this.eventOutput.emit('swiperight');
    });
  }
}

export class HammerConfigService extends HammerGestureConfig {
  override = {
    swipe: {
      direction: Hammer.DIRECTION_HORIZONTAL,
      enable: true,
      pointers: 2,
      threshold: 20,
      velocity: 0.3,
    },
    pinch: { enable: true, threshold: 10 },
    press: { pointer: 1, time: 250 },
    pan: {
      direction: Hammer.DIRECTION_ALL,
      pointers: 1,
      threshold: 5,
    },
  };
}
