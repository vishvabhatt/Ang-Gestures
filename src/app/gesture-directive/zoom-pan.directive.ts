import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appGesture]',
})
export class GestureDirective {
  @Output() pan = new EventEmitter<{ direction: string; fingers: number }>();
  @Output() zoom = new EventEmitter<{ scale: number; fingers: number }>();

  private startX1 = 0;
  private startY1 = 0;
  private startX2 = 0;
  private startY2 = 0;
  private initialDistance = 0;
  private isZooming = false;
  private numFingers = 0;

  constructor(private element: ElementRef) {}

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.numFingers = event.touches.length;

    if (this.numFingers === 1) {
      // Single finger starts panning
      this.startX1 = event.touches[0].clientX;
      this.startY1 = event.touches[0].clientY;
      this.isZooming = false;
    } else if (this.numFingers === 2) {
      // Two fingers start zooming/panning
      this.startX1 = event.touches[0].clientX;
      this.startY1 = event.touches[0].clientY;
      this.startX2 = event.touches[1].clientX;
      this.startY2 = event.touches[1].clientY;

      // Calculate initial distance between two fingers for zoom detection
      this.initialDistance = this.getDistance(
        event.touches[0],
        event.touches[1]
      );
      this.isZooming = false; // We will determine if it's zoom or pan based on movement
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    event.preventDefault(); // Prevent default scrolling/zooming behavior

    if (this.numFingers === 1) {
      // Single-finger pan logic
      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;

      const deltaX = currentX - this.startX1;
      const deltaY = currentY - this.startY1;

      const direction = this.getPanDirection(deltaX, deltaY);

      this.pan.emit({ direction, fingers: this.numFingers });
    } else if (this.numFingers === 2) {
      // Two-finger pan or zoom logic
      const currentX1 = event.touches[0].clientX;
      const currentY1 = event.touches[0].clientY;
      const currentX2 = event.touches[1].clientX;
      const currentY2 = event.touches[1].clientY;

      const deltaX1 = currentX1 - this.startX1;
      const deltaY1 = currentY1 - this.startY1;
      const deltaX2 = currentX2 - this.startX2;
      const deltaY2 = currentY2 - this.startY2;

      const distanceChange =
        this.getDistance(event.touches[0], event.touches[1]) -
        this.initialDistance;

      const isTwoFingerPan = this.isTwoFingerPan(
        deltaX1,
        deltaY1,
        deltaX2,
        deltaY2
      );
      if (isTwoFingerPan) {
        // If both fingers are moving together, treat it as a pan
        const avgDeltaX = (deltaX1 + deltaX2) / 2;
        const avgDeltaY = (deltaY1 + deltaY2) / 2;
        const direction = this.getPanDirection(avgDeltaX, avgDeltaY);
        this.pan.emit({ direction, fingers: 2 });
      } else {
        // If the distance between fingers is changing, treat it as a zoom
        const scale =
          (distanceChange + this.initialDistance) / this.initialDistance;
        this.zoom.emit({ scale, fingers: 2 });
      }
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    this.numFingers = 0;
    this.isZooming = false;
  }

  // Utility to determine the pan direction
  private getPanDirection(deltaX: number, deltaY: number): string {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  // Utility to determine if both fingers are moving in the same direction
  private isTwoFingerPan(
    deltaX1: number,
    deltaY1: number,
    deltaX2: number,
    deltaY2: number
  ): boolean {
    const threshold = 10; // You can adjust the threshold for pan vs zoom sensitivity
    const deltaXDiff = Math.abs(deltaX1 - deltaX2);
    const deltaYDiff = Math.abs(deltaY1 - deltaY2);
    return deltaXDiff < threshold && deltaYDiff < threshold;
  }

  // Utility to get the distance between two touch points
  private getDistance(touch1: Touch, touch2: Touch): number {
    const deltaX = touch1.clientX - touch2.clientX;
    const deltaY = touch1.clientY - touch2.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }
}
