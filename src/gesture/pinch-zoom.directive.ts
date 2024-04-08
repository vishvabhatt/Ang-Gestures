import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DIRECTION_HORIZONTAL, Pan } from 'hammerjs';

@Directive({
  selector: '[appPinchZoom]',
})
export class PinchZoomDirective implements AfterViewInit {
  private adjustDeltaX = 0;
  private adjustDeltaY = 0;
  private adjustScale = 1;

  private currentDeltaX = 0;
  private currentDeltaY = 0;
  private currentScale = 1;

  private images: string[] = ['left', 'center', 'right'];
  private currentIndex = 0;
  @Output() imageUrl = new EventEmitter<string>();

  constructor(private readonly elementRef: ElementRef) {}
  public ngAfterViewInit(): void {
    this.imageUrl.emit(this.images[this.currentIndex]);

    const element = this.elementRef.nativeElement as HTMLElement;
    element.removeEventListener('touchmove', (event) => {
      event.preventDefault();
    });
    const hammerManager = new Hammer.Manager(element);
    const pinch = new Hammer.Pinch();
    const swipeOption: RecognizerOptions = {
      pointers: 1,
      direction: DIRECTION_HORIZONTAL,
    };
    const swipe = new Hammer.Swipe(swipeOption);

    hammerManager.add([swipe, pinch]);
    hammerManager.get('pinch').set({ enable: true });
    hammerManager.on('pinchmove', (event) => {
      console.log('pinchMove');
      this.currentScale = this.adjustScale * event.scale;
      this.currentDeltaX = this.adjustDeltaX + event.deltaX / this.currentScale;
      this.currentDeltaY = this.adjustDeltaY + event.deltaY / this.currentScale;

      let transforms = ['scale(' + this.currentScale + ')'];
      transforms.push(
        'translate(' + this.currentDeltaX + 'px,' + this.currentDeltaY + 'px)'
      );
      element.style.transform = transforms.join(' ');
    });

    hammerManager.on('pinchend', (event) => {
      console.log('end event', event);
      this.adjustScale = this.currentScale;
      this.adjustDeltaX = this.currentDeltaX;
      this.adjustDeltaY = this.currentDeltaY;
    });

    hammerManager.on('swipeleft', (event) => {
      console.log('left-swipped', event);
      this.nextImage();
    });
    hammerManager.on('swiperight', (event) => {
      console.log('right-swipped', event);
      this.prevImage();
    });
    element.addEventListener('touchmove', (event) => {
      const finger1X = event.touches[0].screenX;
      const finger1Y = event.touches[0].screenY;
      const finger2X = event.touches[1].screenX;
      const finger2Y = event.touches[1].screenY;

      const distanceX = finger2X - finger1X;
      const distanceY = finger2Y - finger1Y;
      console.info('the distance x', distanceX, 'the distance y', distanceY);
    });
  }

  private nextImage(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.imageUrl.emit(this.images[this.currentIndex]);
    }
  }

  private prevImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.imageUrl.emit(this.images[this.currentIndex]);
    }
  }
}