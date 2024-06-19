import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pinch-zoom',
  templateUrl: './pinch-zoom.component.html',
  styleUrls: ['./pinch-zoom.component.css'],
})
export class PinchZoomComponent implements OnInit {
  private MIN_SCALE = 1;
  private MAX_SCALE = 64;
  private imageWidth = 0;
  private imageHeight = 0;
  private viewportWidth = 0;
  private viewportHeight = 0;
  private scale = 1;
  private lastScale = 1;
  private imageElement: HTMLImageElement | undefined;
  private container: HTMLElement | undefined;

  private x = 0;
  private lastX = 0;
  private y = 0;
  private lastY = 0;

  private curWidth = 0;
  private curHeight = 0;
  private pinchCenter: { x: number; y: number } | undefined;

  public ngOnInit(): void {
    this.imageElement =
      (document.getElementById('pinch-zoom-image-id') as HTMLImageElement) ??
      undefined;
    if (this.imageElement === undefined) {
      throw new Error('ImageElem is undefined');
    } else {
      if (this.imageElement.parentElement) {
        this.container = this.imageElement.parentElement;
      } else {
        throw new Error('Container is undefined');
      }
    }
    this.disableEvents();
    this.imageWidth = this.imageElement.width;
    this.imageHeight = this.imageElement.height;
    this.viewportWidth = this.imageElement.offsetWidth;
    this.scale = this.viewportWidth / this.imageWidth;
    this.lastScale = this.scale;
    this.viewportHeight = this.container.offsetHeight;
    this.curWidth = this.imageWidth * this.scale;
    this.curHeight = this.imageHeight * this.scale;

    console.log('Values are set, initing hammer');
    const hammer = new Hammer.Manager(this.container);
    const pinch = new Hammer.Pinch();
    hammer.add([pinch]);
    hammer.get('pinch').set({ enable: true });
    console.log('hammer=configured');

    hammer.on('pan', (panEvent) => {
      console.log('=== PanEvent ===');
      this.translate(panEvent.deltaX, panEvent.deltaY);
    });

    hammer.on('panend', (panendedEvent) => {
      console.log('=== pan-ended-event ===');
      this.updateLastPos();
    });

    hammer.on('pinch', (pinchEvent) => {
      console.log('=== pinch event detected ===', pinchEvent.scale);

      // We only calculate the pinch center on the first pinch event as we want the center to
      // stay consistent during the entire pinch
      let pinchCenterOffset: { x: number; y: number } = { x: 0, y: 0 };
      if (this.pinchCenter === undefined) {
        console.log('pitchCenter is undefined');
        this.pinchCenter = this.rawCenter(pinchEvent);
        var offsetX =
          this.pinchCenter.x * this.scale -
          (-this.x * this.scale +
            Math.min(this.viewportWidth, this.curWidth) / 2);
        var offsetY =
          this.pinchCenter.y * this.scale -
          (-this.y * this.scale +
            Math.min(this.viewportHeight, this.curHeight) / 2);
        pinchCenterOffset = { x: offsetX, y: offsetY };
        console.log('calculated=>', pinchCenterOffset);
      }

      // When the user pinch zooms, she/he expects the pinch center to remain in the same
      // relative location of the screen. To achieve this, the raw zoom center is calculated by
      // first storing the pinch center and the scaled offset to the current center of the
      // image. The new scale is then used to calculate the zoom center. This has the effect of
      // actually translating the zoom center on each pinch zoom event.

      var newScale = this.restrictScale(this.scale * pinchEvent.scale);
      var zoomX = this.pinchCenter.x * newScale - pinchCenterOffset.x;
      var zoomY = this.pinchCenter.y * newScale - pinchCenterOffset.y;
      var zoomCenter = { x: zoomX / newScale, y: zoomY / newScale };

      this.zoomAround(pinchEvent.scale, zoomCenter.x, zoomCenter.y, true);
    });
    hammer.on('pinchend', (e) => {
      console.log('pinch-end');
      this.updateLastScale();
      this.updateLastPos();
      this.pinchCenter = undefined;
    });

    hammer.on('doubletap', (e) => {
      var c = this.rawCenter(e);
      this.zoomAround(2, c.x, c.y);
    });
  }
  private disableEvents(): void {
    var eventNames = [
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
    if (this.imageElement) {
      eventNames.forEach((eventName) => {
        console.log('Disabeling Events');
        this.imageElement!.removeEventListener(eventName, (event) => {
          console.log('RemovedEvent', eventName);
          event.preventDefault();
        });
      });
    }
  }
  private absolutePosition(htmlElement: HTMLElement): { x: number; y: number } {
    let x = 0;
    let y = 0;

    while (htmlElement !== null) {
      x += htmlElement.offsetLeft;
      y += htmlElement.offsetTop;
      htmlElement = htmlElement.offsetParent as HTMLElement;
    }
    console.log('AbsoultedPosition', { x, y });
    return { x, y };
  }
  private restrictScale(scale: number): number {
    console.log('RestrictScale', scale);
    if (scale < this.MIN_SCALE) {
      scale = this.MIN_SCALE;
    } else if (scale > this.MAX_SCALE) {
      scale = this.MAX_SCALE;
    }
    return scale;
  }
  private restrictRawPos(
    pos: number,
    viewportDim: number,
    imgDim: number
  ): number {
    if (pos < viewportDim / this.scale - imgDim) {
      // too far left/up?
      pos = viewportDim / this.scale - imgDim;
    } else if (pos > 0) {
      // too far right/down?
      pos = 0;
    }
    return pos;
  }
  private updateLastPos(): void {
    this.lastX = this.x;
    this.lastY = this.y;
  }
  private translate(deltaX: number, deltaY: number): void {
    if (this.imageElement) {
      const newX = this.restrictRawPos(
        this.lastX + deltaX / this.scale,
        Math.min(this.viewportWidth, this.curWidth),
        this.imageWidth
      );
      this.x = newX;
      this.imageElement.style.marginLeft = Math.ceil(newX * this.scale) + 'px';

      const newY = this.restrictRawPos(
        this.lastY + deltaY / this.scale,
        Math.min(this.viewportHeight, this.curHeight),
        this.imageHeight
      );
      this.y = newY;
      this.imageElement.style.marginTop = Math.ceil(newY * this.scale) + 'px';
    }
  }
  private zoom(scaleBy: number): void {
    this.scale = this.restrictScale(this.lastScale * scaleBy);

    this.curWidth = this.imageWidth * this.scale;
    this.curHeight = this.imageHeight * this.scale;

    this.imageElement!.style.width = Math.ceil(this.curWidth) + 'px';
    this.imageElement!.style.height = Math.ceil(this.curHeight) + 'px';

    // Adjust margins to make sure that we aren't out of bounds
    this.translate(0, 0);
  }
  private rawCenter(e: HammerInput) {
    console.log('RawCenter');
    var pos = this.absolutePosition(this.container!);
    // We need to account for the scroll position
    var scrollLeft = window.scrollX ? window.scrollX : document.body.scrollLeft;
    var scrollTop = window.scrollY ? window.scrollY : document.body.scrollTop;

    var zoomX = -this.x + (e.center.x - pos.x + scrollLeft) / this.scale;
    var zoomY = -this.y + (e.center.y - pos.y + scrollTop) / this.scale;
    console.log('RawCenter', 'ZoomX', zoomX, 'ZoomY', zoomY);
    return { x: zoomX, y: zoomY };
  }
  private updateLastScale(): void {
    this.lastScale = this.scale;
  }
  private zoomAround(
    scaleBy: number,
    rawZoomX: number,
    rawZoomY: number,
    doNotUpdateLast: boolean = false
  ): void {
    // Zoom
    console.log('ZoomAround', rawZoomX, rawZoomY, doNotUpdateLast);
    this.zoom(scaleBy);

    // New raw center of viewport
    var rawCenterX =
      -this.x + Math.min(this.viewportWidth, this.curWidth) / 2 / this.scale;
    var rawCenterY =
      -this.y + Math.min(this.viewportHeight, this.curHeight) / 2 / this.scale;

    // Delta
    var deltaX = (rawCenterX - rawZoomX) * this.scale;
    var deltaY = (rawCenterY - rawZoomY) * this.scale;

    // Translate back to zoom center
    this.translate(deltaX, deltaY);

    if (!doNotUpdateLast) {
      this.updateLastScale();
      this.updateLastPos();
    }
  }
  private zoomCenter(scaleBy: number): void {
    var zoomX =
      -this.x + Math.min(this.viewportWidth, this.curWidth) / 2 / this.scale;
    var zoomY =
      -this.y + Math.min(this.viewportHeight, this.curHeight) / 2 / this.scale;
    this.zoomAround(scaleBy, zoomX, zoomY);
  }
}
