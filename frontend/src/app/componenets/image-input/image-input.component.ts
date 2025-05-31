import { Component, ElementRef, ViewChild } from '@angular/core'; 
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 

interface ImageInput {
  file: File;
  name: string;
  size: number;
  preview: string;
  inputType: string; // Type of input (e.g., 'file', 'url', etc.)
  filePath: string;  // Path to the file (if applicable)
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
  extractedText = '';
  copySuccess = false;

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

  constructor() {
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
          inputType: 'file', // Example input type
          filePath: ''       // File path can be set if applicable
        });
      };

      if (file.type === 'application/pdf') {
        resolve({
          file,
          name: file.name,
          size: file.size,
          preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iNCIgZmlsbD0iI0Y3REJEQSI+PC9yZWN0Pgo8dGV4dCB4PSIzMCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNEQzI2MjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBERjwvdGV4dD4KPC9zdmc+Cg==',
          inputType: 'file',
          filePath: ''
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
    if (this.selectedFiles.length === 0) {
      this.extractedText = '';
    }
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
      
      // Fetch the image to validate it
      const response = await fetch(this.imageUrl);
      if (!response.ok) {
        throw new Error('Failed to load image from URL');
      }

      const blob = await response.blob();
      
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL does not point to a valid image');
      }

      // Create a file from the blob
      const file = new File([blob], 'url-image.jpg', { type: blob.type });
      
      if (this.validateFile(file)) {
        const fileWithPreview = await this.createFilePreview(file);
        this.selectedFiles.push(fileWithPreview);
        this.showUrlInput = false;
        this.imageUrl = '';
      }
    } catch (error) {
      console.error('Error loading image from URL:', error);
      alert('Failed to load image from URL. Please check the URL and try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process images for text extraction
   * Note: This is a mock implementation. In a real app, you would integrate with OCR services
   */
  async processImages(): Promise<void> {
    if (this.selectedFiles.length === 0) return;

    this.isProcessing = true;
    this.extractedText = '';

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock text extraction - in reality, you'd call an OCR API
      const mockTexts = [
        "Sample extracted text from your image. In a real implementation, this would be the actual OCR result.",
        "This is a demonstration of text extraction functionality.",
        "Integration with services like Google Vision API, AWS Textract, or Tesseract.js would provide real OCR capabilities.",
        "The extracted text would appear here after processing your uploaded images."
      ];

      this.extractedText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
      
      // For demonstration, add file names
      const fileNames = this.selectedFiles.map(f => f.name).join(', ');
      this.extractedText += `\n\nProcessed files: ${fileNames}`;

    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process images. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Copy extracted text to clipboard
   */
  async copyToClipboard(): Promise<void> {
    if (!this.extractedText) return;

    try {
      await navigator.clipboard.writeText(this.extractedText);
      this.copySuccess = true;
      
      // Reset copy success indicator after 2 seconds
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      alert('Failed to copy text to clipboard');
    }
  }

  /**
   * Download extracted text as TXT file
   */
  downloadText(): void {
    if (!this.extractedText) return;

    const blob = new Blob([this.extractedText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `extracted-text-${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
