import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhishingInterceptionComponent } from './phishing-interception.component';

describe('PhishingInterceptionComponent', () => {
  let component: PhishingInterceptionComponent;
  let fixture: ComponentFixture<PhishingInterceptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhishingInterceptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhishingInterceptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
