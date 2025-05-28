import { Component } from '@angular/core';
import { ImageInputComponent } from '../../componenets/image-input/image-input.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-phishing-interception',
  imports: [CommonModule, ImageInputComponent],
  templateUrl: './phishing-interception.component.html',
  styleUrl: './phishing-interception.component.scss'
})
export class PhishingInterceptionComponent {
  isSidebarHidden = false;

  selectedItem: string = 'phishing-interception'; 

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
