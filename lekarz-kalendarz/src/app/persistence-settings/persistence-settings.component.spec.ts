import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersistenceSettingsComponent } from './persistence-settings.component';

describe('PersistenceSettingsComponent', () => {
  let component: PersistenceSettingsComponent;
  let fixture: ComponentFixture<PersistenceSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersistenceSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersistenceSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
