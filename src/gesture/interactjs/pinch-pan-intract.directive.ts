import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import interact from 'interactjs';

@Directive({
  selector: '[appPinchPanIntract]',
})
export class PinchPanInfractDirective implements AfterViewInit {
  private scaleElement: HTMLElement;
  private gestureElement: HTMLElement;
  private angle = 0;
  private scale = 1;
  private resetTimeout: any;

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
          start: (event) => {
            console.log('EventType', typeof event);
            this.angle -= event.angle;
            clearTimeout(this.resetTimeout);
            this.scaleElement.classList.remove('reset');
          },
          move: (event) => {
            var currentAngle = event.angle + this.angle;
            var currentScale = event.scale * this.scale;

            this.scaleElement.style.transform =
              'rotate(' + currentAngle + 'deg)' + 'scale(' + currentScale + ')';

            this.dragMoveListener(event);
          },
          end: (event) => {
            this.angle = this.angle + event.angle;
            this.scale = this.scale * event.scale;

            this.resetTimeout = setTimeout(this.reset, 1000);
            this.scaleElement.classList.add('reset');
          },
        },
      })
      .draggable({
        listeners: { move: this.dragMoveListener },
      });
  }

  private reset() {
    this.scaleElement.style.transform = 'scale(1)';
    this.angle = 0;
    this.scale = 1;
  }

  private dragMoveListener(event: any) {
    let target = event.target;
    // keep the dragged position in the data-x/data-y attributes
    let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }
}
