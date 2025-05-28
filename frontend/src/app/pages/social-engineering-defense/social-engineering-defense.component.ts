import { Component } from '@angular/core';
import { ImageInputComponent } from '../../componenets/image-input/image-input.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-social-engineering-defense',
  imports: [CommonModule, ImageInputComponent],
  templateUrl: './social-engineering-defense.component.html',
  styleUrl: './social-engineering-defense.component.scss'
})
export class SocialEngineeringDefenseComponent {
  isSidebarHidden = false;

  selectedItem: string = 'social-engineering-defense'; 

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
