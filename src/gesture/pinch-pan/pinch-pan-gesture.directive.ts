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
import { HammerConfigService } from './hammer-config.service';

export const HAMMER_CONFIG_TOKEN = new InjectionToken<HammerGestureConfig>(
  'HAMMER_CONFIG_TOKEN'
);

@Directive({
  selector: '[appPinchPanGesture]',
})
export class PinchPanGestureDirective implements OnInit {
  private targetedElement: HTMLElement;
  private hammerManager: HammerManager;
  private isPinching = false;
  private adjustDeltaX = 0;
  private adjustDeltaY = 0;
  private adjustScale = 1;
  private currentDeltaX = 0;
  private currentDeltaY = 0;
  private currentScale = 1;
  private imageWidth = 0;
  private imageHeight = 0;
  private viewportWidth = 0;
  private viewportHeight = 0;
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
    const pinch = new Hammer.Pinch(this.hammerConfigService.override.pinch);
    const pan = new Hammer.Pan(this.hammerConfigService.override.pan);
    pan.requireFailure(pinch);
    this.hammerManager.add([pinch, pan]);
  }

  private listenHammerCallbacks() {
    this.hammerManager.on('pinchmove', (event) => this.handlePinch(event));
    this.hammerManager.on('pinchend pinchcancel', () => {
      this.isPinching = false;
      this.adjustScale = this.currentScale;
      this.adjustDeltaX = this.currentDeltaX;
      this.adjustDeltaY = this.currentDeltaY;
    });
    this.hammerManager.on('panmove', (event) => {
      if (!this.isPinching) {
        this.handlePan(event);
      }
    });
  }

  private handlePinch(event: HammerInput) {
    this.currentScale = this.adjustScale * event.scale;
    this.currentDeltaX = this.adjustDeltaX + event.deltaX / this.currentScale;
    this.currentDeltaY = this.adjustDeltaY + event.deltaY / this.currentScale;
    this.applyTransform();
  }

  private handlePan(event: HammerInput) {
    this.currentScale = this.adjustScale * event.scale;
    this.currentDeltaX = this.adjustDeltaX + event.deltaX / this.currentScale;
    this.currentDeltaY = this.adjustDeltaY + event.deltaY / this.currentScale;
    this.applyTransform();
  }
  private applyTransform() {
    const transform = `scale(${this.currentScale}) translate(${this.currentDeltaX}px, ${this.currentDeltaY}px)`;
    this.targetedElement.style.transform = transform;
  }
}
