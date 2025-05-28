import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent {
  isSidebarHidden = false;
  selectedItem: string = 'dashboard'; 
  username: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.username = user.username;
      }
    });
  }

  selectItem(item: string): void {
    this.selectedItem = item;

    if (item === 'logout') {
      this.logout();
    }
  }

  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden;
  }

  logout() {
    this.authService.logout();
  }
}