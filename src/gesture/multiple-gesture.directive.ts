import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  OnInit,
  Output,
  Renderer2,
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
  private isPinching = false;

  private adjustDeltaX = 0;
  private adjustDeltaY = 0;
  private adjustScale = 1;

  private currentDeltaX = 0;
  private currentDeltaY = 0;
  private currentScale = 1;
  private imageWidth: number = 800;
  private imageHeight: number = 600;
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;
  private initialScale = 1; // Store initial scale during pinchstart

  @Output() eventOutput = new EventEmitter<string>();

  constructor(
    elementRef: ElementRef,
    private renderer: Renderer2,
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
    this.calculateViewportDimensions();
    this.calculateImageDimensions();
    this.listenHammerCallbacks();
  }

  private calculateViewportDimensions() {
    this.viewportWidth = this.targetedElement.parentElement!.offsetWidth;
    this.viewportHeight = this.targetedElement.parentElement!.offsetHeight;
  }

  private calculateImageDimensions() {
    this.imageWidth = this.targetedElement.offsetWidth;
    this.imageHeight = this.targetedElement.offsetHeight;
  }

  private configureHammerManager() {
    // const press = new Hammer.Pan(this.hammerConfigService.override.press);

    const swipe = new Hammer.Swipe(this.hammerConfigService.override.swipe);
    const pinch = new Hammer.Pinch(this.hammerConfigService.override.pinch);
    const pan = new Hammer.Pan(this.hammerConfigService.override.pan);

    pan.requireFailure(pinch);
    swipe.requireFailure(pinch);
    swipe.requireFailure(pan);

    this.hammerManager.add([pinch, pan, swipe]);
  }

  private listenHammerCallbacks() {
    this.hammerManager.on('pinchstart pinchmove', (event) =>
      this.handlePinch(event)
    );
    this.hammerManager.on('pinchend pinchcancel', () => {
      this.isPinching = false;
    });
    this.hammerManager.on('panstart panmove', (event) => this.handlePan(event));
    /*this.hammerManager.on('pinchstart pinchmove', (event) => {
      this.isPinching = true;
      console.log('pinchstart & move');
      this.eventOutput.emit('pinchstart & move');
      this.hammerManager.get('pan').set({ enable: false });
      this.handlePinch(event);
    });

    this.hammerManager.on('pinchend pinchcancel', (event) => {
      console.log('pinchend');
      this.eventOutput.emit('pinchend');

      this.isPinching = false;
      this.handlePinch(event);

      setTimeout(() => {
        this.hammerManager.get('pan').set({ enable: true });
      }, 10);
    });

    this.hammerManager.on('panstart panmove', (event) => {
      if (!this.isPinching) {
        this.isPinching = false;
        console.log('panstart & move');
        this.eventOutput.emit('panstart & move');
        this.handlePan(event);
      }
    });

    this.hammerManager.on('panend', (event) => {
      if (!this.isPinching) {
        this.isPinching = false;

        console.log('panend');
        this.eventOutput.emit('panend');
        this.handlePan(event);
      }
    });*/
  }

  private handlePinch(event: any) {
    if (event.type === 'pinchstart') {
      this.isPinching = true;
      this.adjustScale = this.currentScale;
      this.adjustDeltaX = this.currentDeltaX;
      this.adjustDeltaY = this.currentDeltaY;
    } else if (event.type === 'pinchmove') {
      this.currentScale = this.adjustScale * event.scale;
      this.currentDeltaX = this.adjustDeltaX + event.deltaX / this.currentScale;
      this.currentDeltaY = this.adjustDeltaY + event.deltaY / this.currentScale;

      // Bounds checking for zooming
      const minScale = 0.5;
      const maxScale = 2.0;
      this.currentScale = Math.max(
        minScale,
        Math.min(maxScale, this.currentScale)
      );

      // Apply transformations using CSS
      const transforms = `scale(${this.currentScale}) translate(${this.currentDeltaX}px, ${this.currentDeltaY}px)`;
      this.targetedElement.style.transform = transforms;
    }
  }

  private handlePan(event: HammerInput) {
    if (!this.isPinching && event.type.includes('pan')) {
      this.currentDeltaX += event.deltaX;
      this.currentDeltaY += event.deltaY;

      // Bounds checking for panning
      const maxX =
        (this.imageWidth * this.currentScale - this.viewportWidth) / 2;
      const maxY =
        (this.imageHeight * this.currentScale - this.viewportHeight) / 2;
      this.currentDeltaX = Math.max(-maxX, Math.min(maxX, this.currentDeltaX));
      this.currentDeltaY = Math.max(-maxY, Math.min(maxY, this.currentDeltaY));

      // Apply transformations using CSS
      const transforms = `scale(${this.currentScale}) translate(${this.currentDeltaX}px, ${this.currentDeltaY}px)`;
      this.targetedElement.style.transform = transforms;
    }
  }
}

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
