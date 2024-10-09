import { Component } from '@angular/core';

@Component({
  selector: 'app-component',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  transform: string = ''; // Stores pan and zoom CSS transformations
  imageTransform: string = ''; // Stores the image scale

  private currentX = 0;
  private currentY = 0;
  private currentScale = 1;

  // Handle pan gesture (correctly typed to match the directive's emitted value)
  onPan(event: { direction: string; fingers: number }) {
    const panDistance = 10; // Adjust as necessary for sensitivity

    if (event.fingers === 2) {
      console.log('Two-finger pan:', event.direction);
    }

    if (event.direction === 'left') {
      this.currentX -= panDistance;
    } else if (event.direction === 'right') {
      this.currentX += panDistance;
    } else if (event.direction === 'up') {
      this.currentY -= panDistance;
    } else if (event.direction === 'down') {
      this.currentY += panDistance;
    }

    this.updateTransform();
  }

  // Handle zoom gesture (correctly typed to match the directive's emitted value)
  onZoom(event: { scale: number; fingers: number }) {
    this.currentScale = event.scale;
    this.updateTransform();
  }

  // Update CSS transform property for panning and zooming
  updateTransform() {
    this.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
    this.imageTransform = `scale(${this.currentScale})`;
  }
}
