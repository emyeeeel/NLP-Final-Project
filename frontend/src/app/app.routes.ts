import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MaliciousUrlDetectionComponent } from './pages/malicious-url-detection/malicious-url-detection.component';
import { NetworkingScamDetectionComponent } from './pages/networking-scam-detection/networking-scam-detection.component';
import { PhishingInterceptionComponent } from './pages/phishing-interception/phishing-interception.component';
import { SocialEngineeringDefenseComponent } from './pages/social-engineering-defense/social-engineering-defense.component';
import { FakeAccountIdentificationComponent } from './pages/fake-account-identification/fake-account-identification.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'malicious-url-detection', component: MaliciousUrlDetectionComponent },
    { path: 'networking-scam-detection', component: NetworkingScamDetectionComponent },
    { path: 'phishing-interception', component: PhishingInterceptionComponent },
    { path: 'social-engineering-defense', component: SocialEngineeringDefenseComponent },
    { path: 'fake-account-identification', component: FakeAccountIdentificationComponent },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
];
