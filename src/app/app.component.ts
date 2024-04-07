import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public imageUrl = '';
  constructor() {}
   public updateImageUrl($event: string) {
    this.imageUrl = `../assets/${$event}`;
    console.log('updateImage', this.imageUrl);
  }
}
