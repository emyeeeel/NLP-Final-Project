import { Component } from '@angular/core';
import { ImageInputComponent } from '../../componenets/image-input/image-input.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fake-account-identification',
  imports: [CommonModule, ImageInputComponent],
  templateUrl: './fake-account-identification.component.html',
  styleUrl: './fake-account-identification.component.scss'
})
export class FakeAccountIdentificationComponent {
  isSidebarHidden = false;

  selectedItem: string = 'fake-account-identification'; 

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
