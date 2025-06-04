import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitterAccountVerifierComponent } from './twitter-account-verifier.component';

describe('TwitterAccountVerifierComponent', () => {
  let component: TwitterAccountVerifierComponent;
  let fixture: ComponentFixture<TwitterAccountVerifierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwitterAccountVerifierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwitterAccountVerifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
