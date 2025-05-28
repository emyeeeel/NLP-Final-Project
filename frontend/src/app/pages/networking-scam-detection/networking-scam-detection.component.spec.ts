import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkingScamDetectionComponent } from './networking-scam-detection.component';

describe('NetworkingScamDetectionComponent', () => {
  let component: NetworkingScamDetectionComponent;
  let fixture: ComponentFixture<NetworkingScamDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkingScamDetectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkingScamDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
