import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { DIRECTION_HORIZONTAL } from 'hammerjs';

@Directive({
  selector: '[appPinchZoom]',
})
export class PinchZoomDirective implements AfterViewInit {
  private adjustDeltaX = 0;
  private adjustDeltaY = 0;
  private adjustScale = 1;

  private currentDeltaX: number | undefined;
  private currentDeltaY: number | undefined;
  private currentScale: number | undefined;

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
    // const swipeOption: RecognizerOptions = {
    //   pointers: 2,
    //   direction: DIRECTION_HORIZONTAL,
    // };
    const swipe = new Hammer.Swipe();

    hammerManager.add([pinch, swipe]);
    hammerManager.get('pinch').set({ enable: true });

    hammerManager.on('pinchmove', (event) => {
      console.log('event ', event);
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
      this.adjustScale = this.currentScale!;
      this.adjustDeltaX = this.currentDeltaX!;
      this.adjustDeltaY = this.currentDeltaY!;
    });

    hammerManager.on('swipeleft', (event) => {
      console.log('left-swipped', event);
      this.nextImage();
    });
    hammerManager.on('swiperight', (event) => {
      console.log('right-swipped', event);
      this.prevImage();
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
