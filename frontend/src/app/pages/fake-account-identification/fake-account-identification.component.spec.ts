import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FakeAccountIdentificationComponent } from './fake-account-identification.component';

describe('FakeAccountIdentificationComponent', () => {
  let component: FakeAccountIdentificationComponent;
  let fixture: ComponentFixture<FakeAccountIdentificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FakeAccountIdentificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FakeAccountIdentificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
