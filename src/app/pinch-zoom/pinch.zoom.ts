import Hammer from 'hammerjs';

interface Point {
    x: number;
    y: number;
}

export class PinchZoom {
    private element: HTMLElement;
    private hammer: HammerManager;
    private scale: number = 1;
    private lastScale: number = 1;
    private lastPosX: number = 0;
    private lastPosY: number = 0;
    private posX: number = 0;
    private posY: number = 0;
    private maxPosX: number = 0;
    private maxPosY: number = 0;
    private transform: string = '';
    private pinchCenter: Point = { x: 0, y: 0 };

    constructor(element: HTMLElement) {
        this.element = element;
        this.hammer = new Hammer(element, {
            domEvents: true
        });

        this.hammer.get('pinch').set({ enable: true });
        this.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

        this.hammer.on('panstart panmove', this.onPan.bind(this));
        this.hammer.on('pinchstart pinchmove', this.onPinch.bind(this));
        this.hammer.on('hammer.input', this.onHammerInput.bind(this));
    }

    private onPan(ev: HammerInput) {
        if (ev.type === 'panstart') {
            this.lastPosX = this.posX;
            this.lastPosY = this.posY;
        }

        this.posX = this.lastPosX + ev.deltaX;
        this.posY = this.lastPosY + ev.deltaY;

        this.transform = `translate3d(${this.posX}px, ${this.posY}px, 0) scale(${this.scale})`;

        this.element.style.transform = this.transform;
    }

    private onPinch(ev: HammerInput) {
        if (ev.type === 'pinchstart') {
            this.lastScale = this.scale || 1;
            this.pinchCenter = { x: ev.center.x - this.posX, y: ev.center.y - this.posY };
        }

        this.scale = Math.max(1, Math.min(this.lastScale * ev.scale, 3));

        this.posX = this.pinchCenter.x - ev.center.x * (this.scale - 1);
        this.posY = this.pinchCenter.y - ev.center.y * (this.scale - 1);

        this.transform = `translate3d(${this.posX}px, ${this.posY}px, 0) scale(${this.scale})`;

        this.element.style.transform = this.transform;
    }

    private onHammerInput(ev: HammerInput) {
        if (ev.isFinal) {
            this.lastPosX = this.posX < this.maxPosX ? this.maxPosX : this.posX;
            this.lastPosY = this.posY < this.maxPosY ? this.maxPosY : this.posY;
        }
    }
}

