import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocketsPage } from './sockets.page';

describe('SocketsPage', () => {
  let component: SocketsPage;
  let fixture: ComponentFixture<SocketsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SocketsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocketsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
