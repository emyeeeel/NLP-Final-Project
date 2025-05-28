import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent implements OnInit {
  isSidebarHidden = false;
  selectedItem: string = 'dashboard'; 
  username: string = '';
  private userSubscription: Subscription | null = null;

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.getCurrentUser().subscribe(user => {
      if (user && user.username) {
        this.username = user.username;
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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