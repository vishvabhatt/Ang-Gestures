import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import interact from 'interactjs';

@Directive({
  selector: '[appPinchPanIntract]',
})
export class PinchPanInfractDirective implements AfterViewInit {
  private scaleElement: HTMLElement;
  private gestureElement: HTMLElement;
  private scale = 1;
  position = { x: 0, y: 0 };

  constructor(elementRef: ElementRef) {
    const gestureArea = document.getElementById('gesture-area');

    if ((elementRef.nativeElement as HTMLElement) && gestureArea !== null) {
      this.scaleElement = elementRef.nativeElement;
      this.gestureElement = gestureArea;
    } else {
      throw new Error('No HTML element found');
    }
  }

  public ngAfterViewInit(): void {
    interact(this.gestureElement)
      .gesturable({
        listeners: {
          move: (event) => {
            event.preventDefault();
            let currentScale = event.scale * this.scale;
            this.scaleElement.style.transform = ' scale(' + currentScale + ')';
            this.dragMoveListener(event);
          },
          end: (event) => {
            this.scale = this.scale * event.scale;
          },
        },
      })
      .draggable({
        listeners: {
          move: (event) => {
            event.preventDefault();
            this.dragMoveListener(event);
          },
        },
      });
  }

  private dragMoveListener(event: any) {
    this.position.x += event.dx;
    this.position.y += event.dy;
    event.target.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
  }
}
