import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pinch-zoom',
  templateUrl: './pinch-zoom.component.html',
  styleUrls: ['./pinch-zoom.component.css'],
})
export class PinchZoomComponent implements OnInit {
  MIN_SCALE = 1; // 1=scaling when first loaded
  MAX_SCALE = 64;

  imgWidth: number | undefined = undefined;
  imgHeight: number | undefined = undefined;
  viewportWidth: number | undefined = undefined;
  viewportHeight: number | undefined = undefined;
  scale: number | undefined = undefined;
  lastScale: number | undefined = undefined;
  container: HTMLElement | undefined = undefined;
  img: HTMLImageElement | undefined = undefined;
  x = 0;
  lastX = 0;
  y = 0;
  lastY = 0;
  pinchCenter: { x: number; y: number } | undefined = undefined;

  constructor() {
    console.log('PinchZoomCompoent');
  }

  ngOnInit(): void {
    this.img = document.getElementById(
      'pinch-zoom-image-id'
    ) as HTMLImageElement;
    this.container = this.img.parentElement as HTMLElement;

    // this.disableImgEventHandlers();

    this.imgWidth = this.img.width;
    this.imgHeight = this.img.height;
    this.viewportWidth = this.img.offsetWidth;
    this.scale = this.viewportWidth / (this.imgWidth as number);
    this.lastScale = this.scale;
    this.viewportHeight = this.img.parentElement?.offsetHeight;
    const curWidth = (this.imgWidth as number) * (this.scale as number);
    const curHeight = (this.imgHeight as number) * (this.scale as number);

    const hammer = new Hammer(this.container, {
      domEvents: true,
    });

    hammer.get('pinch').set({
      enable: true,
    });

    hammer.on('pan', (e: any) => {
      console.log('Pan');
      this.translate(e.deltaX, e.deltaY);
    });

    hammer.on('panend', () => {
      this.updateLastPos();
    });

    hammer.on('pinch', (e: any) => {
      console.log('pinch');

      if (this.pinchCenter === null) {
        this.pinchCenter = this.rawCenter(e);
        const offsetX =
          this.pinchCenter.x * (this.scale as number) -
          (-this.x * (this.scale as number) +
            Math.min(this.viewportWidth as number, curWidth) / 2);
        const offsetY =
          this.pinchCenter.y * (this.scale as number) -
          (-this.y * (this.scale as number) +
            Math.min(this.viewportHeight as number, curHeight) / 2);
        this.pinchCenter = { x: offsetX, y: offsetY };
      }

      const newScale = this.restrictScale((this.scale as number) * e.scale);
      const zoomX = this.pinchCenter!.x * newScale - this.pinchCenter!.x;
      const zoomY = this.pinchCenter!.y * newScale - this.pinchCenter!.y;
      const zoomCenter = { x: zoomX / newScale, y: zoomY / newScale };

      this.zoomAround(e.scale, zoomCenter.x, zoomCenter.y, true);
    });

    hammer.on('pinchend', () => {
      this.updateLastScale();
      this.updateLastPos();
      this.pinchCenter = undefined;
    });

    hammer.on('doubletap', (e: any) => {
      const c = this.rawCenter(e);
      this.zoomAround(2, c.x, c.y);
    });
  }

  disableImgEventHandlers(): void {
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
      this.img!.removeEventListener(event, (listener) => {
        listener.preventDefault();
      });
    });
  }

  absolutePosition(el: HTMLElement): { x: number; y: number } {
    let x = 0;
    let y = 0;

    while (el !== null) {
      x += el.offsetLeft;
      y += el.offsetTop;
      el = el.offsetParent as HTMLElement;
    }

    return { x, y };
  }

  restrictScale(scale: number): number {
    if (scale < this.MIN_SCALE) {
      return this.MIN_SCALE;
    } else if (scale > this.MAX_SCALE) {
      return this.MAX_SCALE;
    }
    return scale;
  }

  updateLastPos(): void {
    this.lastX = this.x;
    this.lastY = this.y;
  }

  translate(deltaX: number, deltaY: number): void {
    const curWidth = (this.imgWidth as number) * (this.scale as number);
    const curHeight = (this.imgHeight as number) * (this.scale as number);

    const newX = this.restrictRawPos(
      this.lastX + deltaX / (this.scale as number),
      Math.min(this.viewportWidth as number, curWidth),
      this.imgWidth as number
    );
    this.x = newX;
    if (this.img) {
      this.img.style.marginLeft =
        Math.ceil(newX * (this.scale as number)) + 'px';
    }

    const newY = this.restrictRawPos(
      this.lastY + deltaY / (this.scale as number),
      Math.min(this.viewportHeight as number, curHeight),
      this.imgHeight as number
    );
    this.y = newY;
    if (this.img) {
      this.img.style.marginTop =
        Math.ceil(newY * (this.scale as number)) + 'px';
    }
  }

  restrictRawPos(pos: number, viewportDim: number, imgDim: number): number {
    if (pos < viewportDim / (this.scale as number) - imgDim) {
      // too far left/up?
      return viewportDim / (this.scale as number) - imgDim;
    } else if (pos > 0) {
      // too far right/down?
      return 0;
    }
    return pos;
  }

  updateLastScale(): void {
    this.lastScale = this.scale;
  }

  rawCenter(e: any): { x: number; y: number } {
    const pos = this.absolutePosition(this.container as HTMLElement);

    const scrollLeft = window.pageXOffset
      ? window.pageXOffset
      : document.body.scrollLeft;
    const scrollTop = window.pageYOffset
      ? window.pageYOffset
      : document.body.scrollTop;
    console.log('scrollleft,', scrollLeft, 'scrolltop,', scrollTop);
    console.log('this.x,', this.x, 'this.y,', this.y);

    const zoomX = -this.x + (e.center.x - pos.x + scrollLeft) / this.scale!;
    const zoomY = -this.y + (e.center.y - pos.y + scrollTop) / this.scale!;
    console.log('zoomx and y co-ords', { x: zoomX, y: zoomY });
    return { x: zoomX, y: zoomY };
  }

  zoomAround(
    scaleBy: number,
    rawZoomX: number,
    rawZoomY: number,
    doNotUpdateLast?: boolean
  ): void {
    this.zoom(scaleBy);

    const rawCenterX =
      -this.x +
      Math.min(this.viewportWidth as number, this.imgWidth as number) /
        2 /
        (this.scale as number);
    const rawCenterY =
      -this.y +
      Math.min(this.viewportHeight as number, this.imgHeight as number) /
        2 /
        (this.scale as number);

    const deltaX = (rawCenterX - rawZoomX) * (this.scale as number);
    const deltaY = (rawCenterY - rawZoomY) * (this.scale as number);

    this.translate(deltaX, deltaY);

    if (!doNotUpdateLast) {
      this.updateLastScale();
      this.updateLastPos();
    }
  }

  zoomCenter(scaleBy: number): void {
    const zoomX =
      -this.x +
      Math.min(this.viewportWidth as number, this.imgWidth as number) /
        2 /
        (this.scale as number);
    const zoomY =
      -this.y +
      Math.min(this.viewportHeight as number, this.imgHeight as number) /
        2 /
        (this.scale as number);

    this.zoomAround(scaleBy, zoomX, zoomY);
  }

  zoomIn(): void {
    this.zoomCenter(2);
  }

  zoomOut(): void {
    this.zoomCenter(1 / 2);
  }

  zoom(scaleBy: number): void {
    this.scale = this.restrictScale((this.lastScale as number) * scaleBy);

    const curWidth = (this.imgWidth as number) * (this.scale as number);
    const curHeight = (this.imgHeight as number) * (this.scale as number);

    if (this.img) {
      this.img.style.width = Math.ceil(curWidth) + 'px';
      this.img.style.height = Math.ceil(curHeight) + 'px';
      this.translate(0, 0);
    }
  }
}
