import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaliciousUrlDetectionComponent } from './malicious-url-detection.component';

describe('MaliciousUrlDetectionComponent', () => {
  let component: MaliciousUrlDetectionComponent;
  let fixture: ComponentFixture<MaliciousUrlDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaliciousUrlDetectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaliciousUrlDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
