import { Component, OnInit, OnDestroy } from '@angular/core';
import { ImageInputComponent } from '../../componenets/image-input/image-input.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-social-engineering-defense',
  imports: [CommonModule, ImageInputComponent],
  templateUrl: './social-engineering-defense.component.html',
  styleUrl: './social-engineering-defense.component.scss'
})
export class SocialEngineeringDefenseComponent implements OnInit, OnDestroy {
  isSidebarHidden = false;
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

  selectedItem: string = 'social-engineering-defense'; 

  selectItem(item: string): void {
    this.selectedItem = item;

    if (item === 'logout') {
      this.logout();
    }
  }

  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden;
  }

  selectedInputType: string = 'text'; 
  
  selectInputType(type: string): void {
    this.selectedInputType = type;
  }

  logout() {
  this.authService.logout();
  }
}
