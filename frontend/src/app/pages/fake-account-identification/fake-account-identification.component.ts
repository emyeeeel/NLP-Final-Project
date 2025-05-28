import { Component, OnInit, OnDestroy } from '@angular/core';
import { ImageInputComponent } from '../../componenets/image-input/image-input.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fake-account-identification',
  imports: [CommonModule, ImageInputComponent],
  templateUrl: './fake-account-identification.component.html',
  styleUrl: './fake-account-identification.component.scss'
})
export class FakeAccountIdentificationComponent implements OnInit, OnDestroy {
  isSidebarHidden = false;
  username: string = '';
  private userSubscription: Subscription | null = null;

  selectedItem: string = 'fake-account-identification'; 

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.getCurrentUser().subscribe(user => {
      if (user && user.username) {
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

  

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
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
