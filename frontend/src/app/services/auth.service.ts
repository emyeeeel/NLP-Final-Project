import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  username: string;
  email: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  refresh: string;
  access: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api'; // Removed trailing slash
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private refreshTokenTimeout: any;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(identifier: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, { identifier, password })
      .pipe(
        tap(response => this.setSession(response)),
        map(response => response.user),
        catchError(error => {
          return throwError(() => new Error(error.error?.detail || 'Login failed. Please check your credentials.'));
        })
      );
  }

  register(name: string, email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, {name, email, password })
      .pipe(
        tap(response => this.setSession(response)),
        map(response => response.user),
        catchError(error => {
          return throwError(() => new Error(error.error?.detail || 'Registration failed. Please try again.'));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.stopRefreshTokenTimer();
    this.router.navigate(['/login']);
  }

  refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/token/refresh/`, { refresh: refreshToken })
      .pipe(
        tap(response => this.setSession(response)),
        catchError(error => {
          this.logout();
          return throwError(() => new Error('Session expired. Please login again.'));
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): Observable<boolean> {
    return this.currentUser.pipe(map(user => !!user));
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser;
  }

  isAdmin(): Observable<boolean> {
    return this.currentUser.pipe(
      map(user => user?.isAdmin || false)
    );
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('access_token', authResult.access);
    localStorage.setItem('refresh_token', authResult.refresh);
    localStorage.setItem('user', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
    this.startRefreshTokenTimer();
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  private startRefreshTokenTimer() {
    // Parse token to get expiration time (assuming JWT)
    const token = this.getToken();
    if (!token) return;
    
    try {
      const jwtToken = JSON.parse(atob(token.split('.')[1] || '{}'));
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000); // Refresh 1 minute before expiry
      this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    } catch (e) {
      console.error('Error starting refresh timer', e);
    }
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}