import { Component } from '@angular/core';

@Component({
  selector: 'app-malicious-url-detection',
  imports: [],
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
}
