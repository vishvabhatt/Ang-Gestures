import { Directive, ElementRef, OnInit } from '@angular/core';
import Hammer from 'hammerjs';

@Directive({
  selector: '[appHammerjs]',
})
export class HammerjsDirective implements OnInit {
  private pinchZoomOrigin: {
    x: number | undefined;
    y: number | undefined;
  } = {
    x: undefined,
    y: undefined,
  };
  private fixHammerjsDeltaIssue: {
    x: number | undefined;
    y: number | undefined;
  } = {
    x: undefined,
    y: undefined,
  };
  private lastEvent: string | undefined = undefined;
  private originalSize = {
    width: 200,
    height: 300,
  };
  private current = {
    x: 0,
    y: 0,
    z: 1,
    zooming: false,
    width: this.originalSize.width * 1,
    height: this.originalSize.height * 1,
  };
  private last = {
    x: this.current.x,
    y: this.current.y,
    z: this.current.z,
  };

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    const element = this.elementRef.nativeElement as HTMLElement;
    const hammertime = new Hammer(this.elementRef.nativeElement);

    hammertime.on('doubletap', (e: HammerInput) => this.doubleTapHandler(e));
    hammertime.on('pan', (e: HammerInput) => this.panHandler(e));
    hammertime.on('pinch', (e: HammerInput) => this.pinchHandler(e));
    hammertime.on('pinchstart', (e: HammerInput) => this.pinchStartHandler(e));
    hammertime.on('panend', (e: HammerInput) => this.panEndHandler(e));
    hammertime.on('pinchend', (e: HammerInput) => this.pinchEndHandler(e));
  }

  doubleTapHandler(e: HammerInput) {
    let scaleFactor = 1;
    if (this.current.zooming === false) {
      this.current.zooming = true;
    } else {
      this.current.zooming = false;
      scaleFactor = -scaleFactor;
    }

    const element = this.elementRef.nativeElement as HTMLElement;
    element.style.transition = '0.3s';
    setTimeout(() => {
      element.style.transition = 'none';
    }, 300);

    const zoomOrigin = this.getRelativePosition(
      element,
      { x: e.center.x, y: e.center.y },
      this.originalSize,
      this.current.z
    );
    const d = this.scaleFrom(
      zoomOrigin,
      this.current.z,
      this.current.z + scaleFactor
    );
    this.current.x += d.x;
    this.current.y += d.y;
    this.current.z += d.z;

    this.last.x = this.current.x;
    this.last.y = this.current.y;
    this.last.z = this.current.z;

    this.update();
  }

  panHandler(e: HammerInput) {
    if (this.lastEvent !== 'pan') {
      this.fixHammerjsDeltaIssue = {
        x: e.deltaX,
        y: e.deltaY,
      };
    }

    this.current.x = this.last.x + e.deltaX - this.fixHammerjsDeltaIssue.x!;
    this.current.y = this.last.y + e.deltaY - this.fixHammerjsDeltaIssue.y!;
    this.lastEvent = 'pan';
    this.update();
  }

  pinchHandler(e: HammerInput) {
    const d = this.scaleFrom(
      this.pinchZoomOrigin,
      this.last.z,
      this.last.z * e.scale
    );
    this.current.x = d.x + this.last.x + e.deltaX;
    this.current.y = d.y + this.last.y + e.deltaY;
    this.current.z = d.z + this.last.z;
    this.lastEvent = 'pinch';
    this.update();
  }

  pinchStartHandler(e: HammerInput) {
    this.pinchZoomOrigin = this.getRelativePosition(
      this.elementRef.nativeElement,
      { x: e.center.x, y: e.center.y },
      this.originalSize,
      this.current.z
    );
    this.lastEvent = 'pinchstart';
  }

  panEndHandler(e: HammerInput) {
    this.last.x = this.current.x;
    this.last.y = this.current.y;
    this.lastEvent = 'panend';
  }

  pinchEndHandler(e: HammerInput) {
    this.last.x = this.current.x;
    this.last.y = this.current.y;
    this.last.z = this.current.z;
    this.lastEvent = 'pinchend';
  }

  getRelativePosition(
    element: HTMLElement,
    point: { x: any; y: any },
    originalSize: { width: any; height: any },
    scale: number
  ) {
    const domCoords = this.getCoords(element);

    const elementX = point.x - domCoords.x;
    const elementY = point.y - domCoords.y;

    const relativeX = elementX / ((originalSize.width * scale) / 2) - 1;
    const relativeY = elementY / ((originalSize.height * scale) / 2) - 1;
    return { x: relativeX, y: relativeY };
  }

  getCoords(elem: HTMLElement) {
    const box = elem.getBoundingClientRect();

    const body = document.body;
    const docEl = document.documentElement;

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft =
      window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;

    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;

    return { x: Math.round(left), y: Math.round(top) };
  }

  scaleFrom(
    zoomOrigin: { x: any; y: any },
    currentScale: number,
    newScale: number
  ) {
    const currentShift = this.getCoordinateShiftDueToScale(
      this.originalSize,
      currentScale
    );
    const newShift = this.getCoordinateShiftDueToScale(
      this.originalSize,
      newScale
    );

    const zoomDistance = newScale - currentScale;

    const shift = {
      x: currentShift.x - newShift.x,
      y: currentShift.y - newShift.y,
    };

    const output = {
      x: zoomOrigin.x * shift.x,
      y: zoomOrigin.y * shift.y,
      z: zoomDistance,
    };
    return output;
  }

  getCoordinateShiftDueToScale(
    size: { width: any; height: any },
    scale: number
  ) {
    const newWidth = scale * size.width;
    const newHeight = scale * size.height;
    const dx = (newWidth - size.width) / 2;
    const dy = (newHeight - size.height) / 2;
    return {
      x: dx,
      y: dy,
    };
  }

  update() {
    this.current.height = this.originalSize.height * this.current.z;
    this.current.width = this.originalSize.width * this.current.z;
    const element = this.elementRef.nativeElement as HTMLElement;
    element.style.transform = `translate3d(${this.current.x}px, ${this.current.y}px, 0) scale(${this.current.z})`;
  }
}
