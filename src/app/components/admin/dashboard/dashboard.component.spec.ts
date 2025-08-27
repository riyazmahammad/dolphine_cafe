import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { OrderService } from '../../../services/order.service';
import { MenuService } from '../../../services/menu.service';
import { Order } from '../../../models/order.model';
import { MenuItem } from '../../../models/menu.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let orderService: jasmine.SpyObj<OrderService>;
  let menuService: jasmine.SpyObj<MenuService>;

  const mockOrders: Order[] = [
    {
      id: 1,
      userId: 1,
      userName: 'John Doe',
      userEmail: 'john@test.com',
      items: [],
      totalAmount: 25.99,
      status: 'DELIVERED',
      orderDate: new Date(),
      createdAt: new Date()
    }
  ];

  const mockMenuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Burger',
      description: 'Delicious burger',
      price: 12.99,
      category: 'Main',
      isAvailable: true,
      preparationTime: 15
    }
  ];

  beforeEach(async () => {
    const orderSpy = jasmine.createSpyObj('OrderService', ['getAllOrders']);
    const menuSpy = jasmine.createSpyObj('MenuService', ['getMenuItems']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: OrderService, useValue: orderSpy },
        { provide: MenuService, useValue: menuSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    menuService = TestBed.inject(MenuService) as jasmine.SpyObj<MenuService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    orderService.getAllOrders.and.returnValue(of(mockOrders));
    menuService.getMenuItems.and.returnValue(of(mockMenuItems));

    component.ngOnInit();

    expect(orderService.getAllOrders).toHaveBeenCalled();
    expect(menuService.getMenuItems).toHaveBeenCalled();
    expect(component.loading).toBeFalsy();
  });

  it('should calculate stats correctly', () => {
    orderService.getAllOrders.and.returnValue(of(mockOrders));
    menuService.getMenuItems.and.returnValue(of(mockMenuItems));

    component.ngOnInit();

    expect(component.stats.totalOrders).toBe(1);
    expect(component.stats.completedOrders).toBe(1);
    expect(component.stats.totalRevenue).toBe(25.99);
    expect(component.stats.activeMenuItems).toBe(1);
  });

  it('should handle error when loading data', () => {
    orderService.getAllOrders.and.returnValue(throwError(() => new Error('API Error')));
    menuService.getMenuItems.and.returnValue(of(mockMenuItems));

    component.ngOnInit();

    expect(component.error).toBe('Failed to load dashboard data');
    expect(component.loading).toBeFalsy();
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(25.99);
    expect(formatted).toBe('$25.99');
  });

  it('should get correct status class', () => {
    expect(component.getStatusClass('PENDING')).toBe('status-pending');
    expect(component.getStatusClass('READY')).toBe('status-ready');
    expect(component.getStatusClass('DELIVERED')).toBe('status-delivered');
  });
});