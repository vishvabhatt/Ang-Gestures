import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
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

  private currentDeltaX = 0;
  private currentDeltaY = 0;
  private currentScale = 1;

  private images: string[] = ['left', 'center', 'right'];

  prevFinger1X = 0;
  prevFinger1Y = 0;
  prevFinger2X = 0;
  prevFinger2Y = 0;

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
      pointers: 2,
      direction: DIRECTION_HORIZONTAL,
    };
    const swipe = new Hammer.Swipe(swipeOption);

    hammerManager.add([swipe, pinch]);
    hammerManager.get('pinch').set({ enable: true });
    hammerManager.on('pinchmove', (event) => {
      console.log('pinchMove', event.direction);

      // Get current finger positions
      var finger1X = event.pointers[0].clientX;
      var finger1Y = event.pointers[0].clientY;
      var finger2X = event.pointers[1].clientX;
      var finger2Y = event.pointers[1].clientY;

      // Calculate direction for finger 1
      var finger1DirectionX =
        finger1X - this.prevFinger1X > 0 ? 'right' : 'left';
      var finger1DirectionY = finger1Y - this.prevFinger1Y > 0 ? 'down' : 'up';
      // Calculate direction for finger 2
      var finger2DirectionX =
        finger2X - this.prevFinger2X > 0 ? 'right' : 'left';
      var finger2DirectionY = finger2Y - this.prevFinger2Y > 0 ? 'down' : 'up';

      if (
        finger1DirectionX === finger2DirectionX ||
        finger1DirectionY === finger2DirectionY
      ) {
        event.preventDefault();
        console.log("It's swipe event - should be swipe image");
      }
      // Output directions
      console.log(
        'Finger 1: X direction - ' +
          finger1DirectionX +
          ', Y direction - ' +
          finger1DirectionY
      );
      console.log(
        'Finger 2: X direction - ' +
          finger2DirectionX +
          ', Y direction - ' +
          finger2DirectionY
      );

      // Update previous finger positions
      this.prevFinger1X = finger1X;
      this.prevFinger1Y = finger1Y;
      this.prevFinger2X = finger2X;
      this.prevFinger2Y = finger2Y;

      this.currentScale = this.adjustScale * event.scale;
      this.currentDeltaX = this.adjustDeltaX + event.deltaX / this.currentScale;
      this.currentDeltaY = this.adjustDeltaY + event.deltaY / this.currentScale;

      let transforms = ['scale(' + this.currentScale + ')'];
      transforms.push(
        'translate(' + this.currentDeltaX + 'px,' + this.currentDeltaY + 'px)'
      );
      element.style.transform = transforms.join(' ');
    });

    hammerManager.on('pinchstart', (ev) => {
      this.prevFinger1X = ev.pointers[0].clientX;
      this.prevFinger1Y = ev.pointers[0].clientY;
      this.prevFinger2X = ev.pointers[1].clientX;
      this.prevFinger2Y = ev.pointers[1].clientY;
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

    hammerManager.on('hammer.input', (ev) => {
      console.log(ev.pointers);
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
