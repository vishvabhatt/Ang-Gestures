import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css'],
})
export class DrawingComponent implements OnInit, OnDestroy {
  @ViewChild('drawingCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  private eventListeners: (() => void)[] = [];
  private destroyRequested = false;
  private listenersActive = false;

  ngOnInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = 'red';

    this.addListeners();
  }

  private attachEventListeners(canvas: HTMLCanvasElement) {
    const pointerDownHandler = (event: PointerEvent) =>
      this.handlePointerDown(event);
    const pointerMoveHandler = (event: PointerEvent) =>
      this.handlePointerMove(event);
    const pointerUpHandler = (event: PointerEvent) =>
      this.handlePointerUp(event);

    canvas.addEventListener('pointerdown', pointerDownHandler);
    canvas.addEventListener('pointermove', pointerMoveHandler);
    canvas.addEventListener('pointerup', pointerUpHandler);
    canvas.addEventListener('pointercancel', pointerUpHandler);

    this.eventListeners.push(() =>
      canvas.removeEventListener('pointerdown', pointerDownHandler)
    );
    this.eventListeners.push(() =>
      canvas.removeEventListener('pointermove', pointerMoveHandler)
    );
    this.eventListeners.push(() =>
      canvas.removeEventListener('pointerup', pointerUpHandler)
    );
    this.eventListeners.push(() =>
      canvas.removeEventListener('pointercancel', pointerUpHandler)
    );

    this.listenersActive = true;
    console.log('Event listeners attached.');
  }

  private handlePointerDown(event: PointerEvent) {
    if (this.destroyRequested) return;

    event.preventDefault();
    event.stopPropagation();

    const canvas = this.canvasRef.nativeElement;
    canvas.setPointerCapture(event.pointerId);

    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(event.offsetX, event.offsetY);
  }

  private handlePointerMove(event: PointerEvent) {
    if (!this.isDrawing || this.destroyRequested) return;

    event.preventDefault();
    event.stopPropagation();

    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.stroke();
  }

  private handlePointerUp(event: PointerEvent) {
    if (this.destroyRequested) return;

    event.preventDefault();
    event.stopPropagation();

    const canvas = this.canvasRef.nativeElement;
    canvas.releasePointerCapture(event.pointerId);

    this.isDrawing = false;
    this.ctx.closePath();
  }

  clearCanvas() {
    this.ctx.clearRect(
      0,
      0,
      this.canvasRef.nativeElement.width,
      this.canvasRef.nativeElement.height
    );
  }

  removeListeners() {
    if (!this.listenersActive) {
      console.warn('Listeners are already removed.');
      return;
    }

    this.eventListeners.forEach((cleanup) => cleanup());
    this.eventListeners = [];
    this.listenersActive = false;

    console.log('Event listeners removed.');
  }

  addListeners() {
    if (this.listenersActive) {
      console.warn('Listeners are already active.');
      return;
    }

    this.attachEventListeners(this.canvasRef.nativeElement);
  }

  ngOnDestroy() {
    this.destroyRequested = true;
    this.removeListeners();
  }
}
