import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  identifier: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  returnUrl: string = '/home';

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    });
  }

  onSubmit(): void {
    if (!this.identifier || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.identifier, this.password).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      }, 
      error: (error) => {
        this.error = error.message || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }
}
