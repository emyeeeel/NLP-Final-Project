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
  };
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
  }

  logout() {
  this.authService.logout();
  }
  
  textInput: string = '';
  urlInput: string = ''; 
  apiResponse: any = null; 

  extractUrlsFromApiResponse(): void {
    if (!this.apiResponse) {
      alert('No text available to extract URLs.');
      return;
    }
  
    const extractUrlsApiUrl = 'http://localhost:8000/api/extract-urls/';
    this.http.post<{ urls: string[] }>(extractUrlsApiUrl, { text: this.apiResponse }).subscribe(
      (response) => {
        console.log('Extracted URLs:', response.urls);
        this.extractedUrls = response.urls; // Store the extracted URLs for display
      },
      (error) => {
        console.error('Error occurred while extracting URLs:', error);
        alert('Failed to extract URLs from the API.');
      }
    );
  }
  
  // Add a property to store extracted URLs
  extractedUrls: string[] = [];
  
  // Modify detectMaliciousUrl to call extractUrlsFromApiResponse after fetching the text
  detectMaliciousUrl(): void {
    console.log("Enter function");
    if (!this.urlInput) {
      alert('Please enter a URL.');
      return;
    }
  
    const apiUrl = 'http://localhost:8000/api/scrape-tweet/';
    this.http.post<ApiResponse>(apiUrl, { url: this.urlInput }).subscribe(
      (response) => {
        this.apiResponse = response.data.text || 'No text found';
        console.log('Extracted Text:', this.apiResponse);
  
        // Call the method to extract URLs
        this.extractUrlsFromApiResponse();
      },
      (error) => {
        console.error('Error occurred:', error);
        alert('Failed to fetch data from the API.');
      }
    );
  }

 
  postTextToExtractUrlsApi(): void {
    if (!this.textInput) {
      alert('No text provided to extract URLs.');
      return;
    }

    this.apiResponse = this.textInput;
  
    const extractUrlsApiUrl = 'http://localhost:8000/api/extract-urls/';
    this.http.post<{ urls: string[] }>(extractUrlsApiUrl, { text: this.textInput }).subscribe(
      (response) => {
        console.log('Extracted URLs:', response.urls);
        this.extractedUrls = response.urls; // Store the extracted URLs for display
      },
      (error) => {
        console.error('Error occurred while extracting URLs:', error);
        alert('Failed to extract URLs from the API.');
      }
    );
  }

}
