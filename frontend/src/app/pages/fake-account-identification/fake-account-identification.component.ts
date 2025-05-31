import { Component, OnInit, OnDestroy } from '@angular/core';
import { ImageInputComponent } from '../../componenets/image-input/image-input.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-fake-account-identification',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fake-account-identification.component.html',
  styleUrl: './fake-account-identification.component.scss'
})
export class FakeAccountIdentificationComponent implements OnInit, OnDestroy {
  isSidebarHidden = false;
  username: string = '';
  private userSubscription: Subscription | null = null;

  profileForm: FormGroup;
  analysisResult: any = null;
  isLoading = false;
  error: string | null = null;

  selectedItem: string = 'fake-account-identification'; 

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      followers: ['', [Validators.required, Validators.min(0)]],
      following: ['', [Validators.required, Validators.min(0)]],
      bio: [''],
      is_private: [false],
      is_joined_recently: [false],
      is_business_account: [false],
      has_channel: [false],
      has_guides: [false],
      has_external_url: [false]
    });
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

  async analyzeProfile() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await fetch('http://localhost:8000/api/analyze-instagram-profile/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.profileForm.value)
        });
        
        this.analysisResult = await response.json();
      } catch (err) {
        this.error = 'Failed to analyze profile';
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    }
  }

  logout() {
  this.authService.logout();
  }
}
