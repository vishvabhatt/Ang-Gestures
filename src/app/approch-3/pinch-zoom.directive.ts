import { AfterViewInit, Directive, ElementRef } from '@angular/core';

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

  constructor(private readonly elementRef: ElementRef) {
    console.log('PinchZoomDirective', this.elementRef);
  }
  public ngAfterViewInit(): void {
    const element = this.elementRef.nativeElement as HTMLElement;
    element.removeEventListener('touchmove', (event) => {
      event.preventDefault();
    });
    const mc = new Hammer.Manager(element);
    const pan = new Hammer.Pan();
    const pinch = new Hammer.Pinch();
    mc.add([pan, pinch]);
    mc.get('pinch').set({ enable: true });

    mc.on('panmove pinchmove rotatemove', (event) => {
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

    mc.on('panend pinchend', (event) => {
      console.log('end event', event);
      this.adjustScale = this.currentScale!;
      this.adjustDeltaX = this.currentDeltaX!;
      this.adjustDeltaY = this.currentDeltaY!;
    });
  }
}
