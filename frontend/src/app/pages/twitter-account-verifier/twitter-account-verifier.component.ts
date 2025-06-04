import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-twitter-account-verifier',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './twitter-account-verifier.component.html',
  styleUrls: ['./twitter-account-verifier.component.scss']
})
export class TwitterAccountVerifierComponent implements OnInit, OnDestroy {
  verifierForm: FormGroup;
  result: any = null;
  isLoading = false;
  error: string | null = null;

  isSidebarHidden = false;
  username: string = '';
  private userSubscription: Subscription | null = null;

  selectedItem: string = 'twitter-account-verifier';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.verifierForm = this.fb.group({
      username: ['', Validators.required],
    });
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

  toggleSidebar(): void {
    this.isSidebarHidden = !this.isSidebarHidden;
  }

  selectItem(item: string): void {
    this.selectedItem = item;
    if (item === 'logout') {
      this.logout();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  async verifyAccount() {
    if (this.verifierForm.valid) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await fetch('http://localhost:8000/api/verify-twitter-account/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify( this.verifierForm.value ),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        this.result = await response.json();
      } catch (err) {
        this.error = 'An error occurred while verifying the account.';
      } finally {
        this.isLoading = false;
      }
    }
  }

  // onSubmit() {
  //   if (this.form.valid) {
  //     // Call the API to verify the Twitter account
  //   }
  // }
}
