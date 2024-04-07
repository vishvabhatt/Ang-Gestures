import { Directive, ElementRef } from '@angular/core';
import * as Hammer from 'hammerjs';

@Directive({
  selector: '[appPanZoom]',
})
export class PanZoomDirective {
  private MIN_SCALE = 1; // 1=scaling when first loaded
  private MAX_SCALE = 64;

  // HammerJS fires "pinch" and "pan" events that are cumulative in nature and not
  // deltas. Therefore, we need to store the "last" values of scale, x and y so that we can
  // adjust the UI accordingly. It isn't until the "pinchend" and "panend" events are received
  // that we can set the "last" values.

  // Our "raw" coordinates are not scaled. This allows us to only have to modify our stored
  // coordinates when the UI is updated. It also simplifies our calculations as these
  // coordinates are without respect to the current scale.

  private imgWidth = null;
  private imgHeight = null;
  private viewportWidth = null;
  private viewportHeight = null;
  private scale = null;
  private lastScale = null;
  private container = null;
  private img = null;
  private x = 0;
  private lastX = 0;
  private y = 0;
  private lastY = 0;
  private pinchCenter = null;
  private element;

  constructor(private elementRef: ElementRef) {
    console.log('Elment', elementRef);

    var events = [
      'onclick',
      'onmousedown',
      'onmousemove',
      'onmouseout',
      'onmouseover',
      'onmouseup',
      'ondblclick',
      'onfocus',
      'onblur',
    ];

    events.forEach((event) => {
      (elementRef.nativeElement as HTMLElement).removeEventListener(
        event,
        (listener) => {
          listener.preventDefault();
        }
      );
    });
  }

  private absolutePosition(element: HTMLElement): Position {
    let x = 0;
    let y = 0;

    while (element) {
      x += element.offsetLeft;
      y += element.offsetTop;
      this.element = element.offsetParent as HTMLElement;
    }

    return { x, y };
  }
}
interface Position {
  x: number;
  y: number;
}
