import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageInputComponent } from "../../componenets/image-input/image-input.component";

@Component({
  selector: 'app-home',
  imports: [CommonModule, ImageInputComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isSidebarHidden = false;

  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden;
  }
}