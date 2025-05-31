import { Component, ElementRef, ViewChild } from '@angular/core'; 
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';

interface ImageInput {
  file?: File;
  name: string;
  size?: number;
  preview: string;
  inputType: 'file' | 'url';
  filePath: string;
}

@Component({
  selector: 'app-image-input',
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.scss'],
  imports: [
    FormsModule, 
    CommonModule
  ],
})
export class ImageInputComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Component state
  selectedFiles: ImageInput[] = [];
  isDragOver = false;
  showUrlInput = false;
  imageUrl = '';
  isProcessing = false;

  // Supported file types
  private supportedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];

  // Maximum file size (10MB)
  private maxFileSize = 10 * 1024 * 1024;

  constructor(private http: HttpClient) {
    // Listen for paste events
    document.addEventListener('paste', (e) => this.onPaste(e));
  }

  ngOnDestroy() {
    document.removeEventListener('paste', (e) => this.onPaste(e));
  }

  /**
   * Trigger the hidden file input
   */
  triggerFileInput(): void {
    if (!this.showUrlInput && !this.isProcessing) {
      this.fileInput.nativeElement.click();
    }
  }

  /**
   * Handle file selection from input
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  /**
   * Handle file drop
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  /**
   * Handle paste events for images
   */
  onPaste(event: ClipboardEvent): void {
    if (!event.clipboardData) return;

    const items = Array.from(event.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));

    if (imageItems.length > 0) {
      event.preventDefault();
      const files = imageItems
        .map(item => item.getAsFile())
        .filter(file => file !== null) as File[];
      
      this.handleFiles(files);
    }
  }

  /**
   * Process and validate files
   */
  private async handleFiles(files: File[]): Promise<void> {
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (this.validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      const filesWithPreview = await Promise.all(
        validFiles.map(file => this.createFilePreview(file))
      );
      
      this.selectedFiles = [...this.selectedFiles, ...filesWithPreview];
      this.showUrlInput = false;
    }
  }

  /**
   * Validate file type and size
   */
  private validateFile(file: File): boolean {
    if (!this.supportedTypes.includes(file.type)) {
      alert(`Unsupported file type: ${file.type}. Please use JPG, PNG, GIF, or PDF files.`);
      return false;
    }

    if (file.size > this.maxFileSize) {
      alert(`File size too large: ${this.formatFileSize(file.size)}. Maximum size is ${this.formatFileSize(this.maxFileSize)}.`);
      return false;
    }

    return true;
  }

  /**
   * Create file preview object
   */
  private async createFilePreview(file: File): Promise<ImageInput> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve({
          file,
          name: file.name,
          size: file.size,
          preview: e.target?.result as string,
          inputType: 'file',
          filePath: file.name // For files, you might want to use file.name or a generated path
        });
      };

      if (file.type === 'application/pdf') {
        resolve({
          file,
          name: file.name,
          size: file.size,
          preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iNCIgZmlsbD0iI0Y3REJEQSI+PC9yZWN0Pgo8dGV4dCB4PSIzMCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNEQzI2MjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBERjwvdGV4dD4KPC9zdmc+Cg==',
          inputType: 'file',
          filePath: file.name
        });
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

  /**
   * Remove file from selection
   */
  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  /**
   * Toggle URL input display
   */
  toggleUrlInput(): void {
    this.showUrlInput = !this.showUrlInput;
    if (!this.showUrlInput) {
      this.imageUrl = '';
    }
  }

  /**
   * Load image from URL
   */
  async loadFromUrl(): Promise<void> {
    if (!this.imageUrl) return;

    try {
      this.isProcessing = true;
      
      // Create ImageInput for URL
      const urlImageInput: ImageInput = {
        name: 'URL Image',
        preview: this.imageUrl, // Use URL directly as preview
        inputType: 'url',
        filePath: this.imageUrl // For URLs, filePath is the URL itself
      };

      this.selectedFiles.push(urlImageInput);
      this.showUrlInput = false;
      this.imageUrl = '';
    } catch (error) {
      console.error('Error loading image from URL:', error);
      alert('Failed to load image from URL. Please check the URL and try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Send data to OCR API
   */
  async sendToOCR(imageInput: ImageInput): Promise<void> {
    try {
      this.isProcessing = true;
      
      let requestData: any;
      let headers: any = {};
      
      if (imageInput.inputType === 'url') {
        // For URL inputs, send as JSON
        requestData = {
          image_url: imageInput.filePath
        };
        headers['Content-Type'] = 'application/json';
      } else {
        // For file uploads, send as FormData
        const formData = new FormData();
        if (imageInput.file) {
          formData.append('image_file', imageInput.file);
        }
        requestData = formData;
        // Don't set Content-Type header for FormData - let browser set it with boundary
      }

      const response = await this.http.post('http://127.0.0.1:8000/api/extract-urls/ocr/', requestData, { headers }).toPromise();
      console.log('OCR Response:', response);
      
    } catch (error) {
      console.error('Error sending to OCR API:', error);
      alert('Failed to process image with OCR API');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process selected images
   */
  processImages(): void {
    this.selectedFiles.forEach(imageInput => {
      this.sendToOCR(imageInput);
    });
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}