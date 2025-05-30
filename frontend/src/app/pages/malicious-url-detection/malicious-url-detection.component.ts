import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ImageInputComponent } from "../../componenets/image-input/image-input.component";
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface ApiResponse {
  success: boolean;
  data: {
    text: string;
    external_links?: Array<{ url: string; text: string }>;
    method?: string;
    error?: string; 
  };
}

interface RiskAssessmentResponse {
  url: string;
  malicious_probability: number;
  risk_level: string;
  prediction: string;
  warning: string;
  recommendation: string;
}

@Component({
  selector: 'app-malicious-url-detection',
  imports: [CommonModule, ImageInputComponent, FormsModule],
  templateUrl: './malicious-url-detection.component.html',
  styleUrl: './malicious-url-detection.component.scss'
})
export class MaliciousUrlDetectionComponent implements OnInit, OnDestroy {
  isSidebarHidden = false;
  username: string = '';
  private userSubscription: Subscription | null = null;

  selectedItem: string = 'malicious-url-detection'; 

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {
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

  selectedInputType: string = 'text'; 
  
  selectInputType(inputType: string): void {
    this.selectedInputType = inputType;
  
    // Reset input fields
    this.textInput = '';
    this.urlInput = '';
    
    // Reset output variables
    this.apiResponse = null;
    this.extractedUrls = [];
    this.detectionResponse = [];
  }

  logout() {
  this.authService.logout();
  }
  
  textInput: string = '';
  urlInput: string = ''; 
  extractedRawText: any = null;  
  apiResponse: any = null; 
  detectionResponse: RiskAssessmentResponse[] = [];
  errorMessage: string = '';
  extractedUrls: string[] = [];
  isLoading = false;

  // Helper function to ensure URLs have valid headers
  private ensureValidUrlHeaders(urls: string[]): string[] {
    return urls.map(url => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    });
  }

  processURLinput(): void {
    this.isLoading = true;
    setTimeout(() => {
        if (!this.urlInput) {
            alert('Please enter a URL.');
            this.isLoading = false;
            return;
        }

        const apiUrl = 'http://localhost:8000/api/scrape-tweet/';
        this.http.post<ApiResponse>(apiUrl, { url: this.urlInput }).subscribe(
            (response) => {
                if (response.data.error) {
                    this.apiResponse = response.data.error;
                    this.isLoading = false;
                    return;
                }
                this.apiResponse = response.data.text || 'No text found';
                this.extractedRawText = this.apiResponse;
                console.log('Extracted Raw Text:', this.extractedRawText);
                if (this.extractedRawText === 'No text found') {
                    this.isLoading = false;
                    return;
                }

                const extractUrlsApiUrl = 'http://localhost:8000/api/extract-urls/';
                this.http.post<{ urls: string[] }>(extractUrlsApiUrl, { text: this.extractedRawText }).subscribe(
                    (response) => {
                        console.log('Extracted URLs:', response.urls);
                        this.extractedUrls = this.ensureValidUrlHeaders(response.urls);

                        if (!this.extractedUrls || this.extractedUrls.length === 0) {
                            alert('No URLs available for analysis.');
                            this.isLoading = false;
                            return;
                        }

                        const riskAssessmentApiUrl = 'http://localhost:8000/api/risk-assessment/batch/';
                        this.http.post<RiskAssessmentResponse[]>(riskAssessmentApiUrl, { urls: this.extractedUrls }).subscribe(
                            (response) => {
                                console.log('Risk Assessment Response:', response);
                                this.detectionResponse = response;
                                this.isLoading = false;
                            },
                            (error) => {
                                console.error('Error occurred while assessing risk:', error);
                                alert('Failed to assess risk for the URLs.');
                                this.isLoading = false;
                            }
                        );
                    },
                    (error) => {
                        console.error('Error occurred while extracting URLs:', error);
                        alert('Failed to extract URLs from the API.');
                        this.isLoading = false;
                    }
                );
            },
            (error) => {
                console.error('Error occurred:', error);
                alert('Failed to fetch data from the API.');
                this.isLoading = false;
            }
        );
    }, 2000); // 2-second timeout
}

  processTextInput(): void{
    this.isLoading = true;
    setTimeout(() => {
        const extractUrlsApiUrl = 'http://localhost:8000/api/extract-urls/';
        this.http.post<{ urls: string[] }>(extractUrlsApiUrl, { text: this.textInput }).subscribe(
            (response) => {
                console.log('Extracted URLs:', response.urls);
                this.extractedUrls = this.ensureValidUrlHeaders(response.urls);

                if (!this.extractedUrls || this.extractedUrls.length === 0) {
                    alert('No URLs available for analysis.');
                    this.isLoading = false;
                    return;
                }

                const riskAssessmentApiUrl = 'http://localhost:8000/api/risk-assessment/batch/';
                this.http.post<RiskAssessmentResponse[]>(riskAssessmentApiUrl, { urls: this.extractedUrls }).subscribe(
                    (response) => {
                        console.log('Risk Assessment Response:', response);
                        this.detectionResponse = response;
                        this.isLoading = false;
                    },
                    (error) => {
                        console.error('Error occurred while assessing risk:', error);
                        alert('Failed to assess risk for the URLs.');
                        this.isLoading = false;
                    }
                );
            },
            (error) => {
                console.error('Error occurred while extracting URLs:', error);
                alert('Failed to extract URLs from the API.');
                this.isLoading = false;
            }
        );
    }, 2000); // 2-second timeout
}
}
