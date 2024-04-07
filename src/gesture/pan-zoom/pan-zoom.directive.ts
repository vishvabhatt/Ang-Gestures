import { Directive, ElementRef } from '@angular/core';
import * as Hammer from 'hammerjs';

@Directive({
  selector: '[appPanZoom]',
})
export class PanZoomDirective {
  constructor(private elementRef: ElementRef) {
    console.log('Elment', elementRef);
  }

  ngOnInit() {
    const element = this.elementRef.nativeElement;

    // Initialize HammerJS
    const hammerManager = new Hammer.Manager(element);
    const pinch = new Hammer.Pinch();

    hammerManager.add([pinch]);

    let posX = 0;
    let posY = 0;
    let scale = 1;
    let lastScale = 1;
    let lastPosX = 0;
    let lastPosY = 0;

    hammerManager.on('pinchmove', (ev) => {
      // Handle pinch to zoom
      console.log('pitchmove');
      scale = Math.max(1, Math.min(lastScale * ev.scale, 10));
      element.style.transform = `translate(${lastPosX}px, ${lastPosY}px) scale(${scale})`;
    });

    hammerManager.on('panmove', (ev) => {
      // Handle pan
      console.log('panmove');

      posX = ev.deltaX + lastPosX;
      posY = ev.deltaY + lastPosY;
      element.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    });

    hammerManager.on('panend', () => {
      // Store last position after pan
      console.log('panend');
      lastPosX = posX;
      lastPosY = posY;
    });

    hammerManager.on('pinchend', () => {
      console.log('pinchend');
      // Store last scale after pinch
      lastScale = scale;
    });
  }
}
