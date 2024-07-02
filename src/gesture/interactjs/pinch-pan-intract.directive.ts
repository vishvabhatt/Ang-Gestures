import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import interact from 'interactjs';

@Directive({
  selector: '[appPinchPanIntract]',
})
export class PinchPanInfractDirective implements AfterViewInit {
  private scaleElement: HTMLElement;
  private gestureElement: HTMLElement;
  private scale = 1;

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
            requestAnimationFrame(() => {
              const currentScale = event.scale * this.scale;
              this.scaleElement.style.transform = `scale(${currentScale})`;
              this.dragMoveListener(event);
            });
          },
          end: (event) => {
            this.scale *= event.scale;
          },
        },
      })
      .draggable({
        listeners: { move: this.dragMoveListener },
      });
  }

  private dragMoveListener(event: any) {
    requestAnimationFrame(() => {
      const target = event.target;
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      target.style.transform = `translate(${x}px, ${y}px)`;
      target.setAttribute('data-x', x.toString());
      target.setAttribute('data-y', y.toString());
    });
  }
}
