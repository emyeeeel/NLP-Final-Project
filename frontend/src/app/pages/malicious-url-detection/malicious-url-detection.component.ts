import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ImageInputComponent } from "../../componenets/image-input/image-input.component";

@Component({
  selector: 'app-malicious-url-detection',
  imports: [CommonModule, ImageInputComponent],
  templateUrl: './malicious-url-detection.component.html',
  styleUrl: './malicious-url-detection.component.scss'
})
export class MaliciousUrlDetectionComponent {
  isSidebarHidden = false;

  selectedItem: string = 'malicious-url-detection'; 

  selectItem(item: string): void {
    this.selectedItem = item;
  }

  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden;
  }

  selectedInputType: string = 'text'; // Default input type

  selectInputType(type: string): void {
    this.selectedInputType = type;
  }
}
