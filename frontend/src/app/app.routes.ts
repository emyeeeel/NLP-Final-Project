import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MaliciousUrlDetectionComponent } from './pages/malicious-url-detection/malicious-url-detection.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'malicious-url-detection', component: MaliciousUrlDetectionComponent },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
];
