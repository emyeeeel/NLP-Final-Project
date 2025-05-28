import { Component } from '@angular/core';
import { ImageInputComponent } from '../../componenets/image-input/image-input.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-networking-scam-detection',
  imports: [CommonModule, ImageInputComponent],
  templateUrl: './networking-scam-detection.component.html',
  styleUrl: './networking-scam-detection.component.scss'
})
export class NetworkingScamDetectionComponent {
  isSidebarHidden = false;

  selectedItem: string = 'networking-scam-detection'; 

  selectItem(item: string): void {
    this.selectedItem = item;
  }

  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden;
  }

  selectedInputType: string = 'text'; 
  
  selectInputType(type: string): void {
    this.selectedInputType = type;
  }
}
