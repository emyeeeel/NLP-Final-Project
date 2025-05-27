import { Component } from '@angular/core';
import { ImageInputComponent } from "../../componenets/image-input/image-input.component";

@Component({
  selector: 'app-home',
  imports: [ImageInputComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
