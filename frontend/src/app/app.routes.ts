import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MaliciousUrlDetectionComponent } from './pages/malicious-url-detection/malicious-url-detection.component';
import { NetworkingScamDetectionComponent } from './pages/networking-scam-detection/networking-scam-detection.component';
import { PhishingInterceptionComponent } from './pages/phishing-interception/phishing-interception.component';
import { SocialEngineeringDefenseComponent } from './pages/social-engineering-defense/social-engineering-defense.component';
import { FakeAccountIdentificationComponent } from './pages/fake-account-identification/fake-account-identification.component';
import { LoginGuard } from './guards/login.guard';
import { AuthGuard } from './guards/auth.guard';


export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full'},
    { path: 'malicious-url-detection', component: MaliciousUrlDetectionComponent, canActivate: [AuthGuard] },
    { path: 'networking-scam-detection', component: NetworkingScamDetectionComponent, canActivate: [AuthGuard] },
    { path: 'phishing-interception', component: PhishingInterceptionComponent, canActivate: [AuthGuard] },
    { path: 'social-engineering-defense', component: SocialEngineeringDefenseComponent, canActivate: [AuthGuard] },
    { path: 'fake-account-identification', component: FakeAccountIdentificationComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [LoginGuard] },
];
