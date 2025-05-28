import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialEngineeringDefenseComponent } from './social-engineering-defense.component';

describe('SocialEngineeringDefenseComponent', () => {
  let component: SocialEngineeringDefenseComponent;
  let fixture: ComponentFixture<SocialEngineeringDefenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialEngineeringDefenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialEngineeringDefenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
