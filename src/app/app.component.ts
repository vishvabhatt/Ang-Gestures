import { Component } from '@angular/core';
import { PanZoomConfig } from 'ngx-panzoom';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public imageUrl = '../assets/clouds.jpg';
  public eventOutput: string = '';
  public panZoomConfig: PanZoomConfig = new PanZoomConfig();

  constructor() {}
  public onEventOutput(event: string) {
    this.eventOutput = this.eventOutput + event;
  }
}
