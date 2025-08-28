import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { OrderHistoryComponent } from './order-history.component';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

describe('OrderHistoryComponent', () => {
  let component: OrderHistoryComponent;
  let fixture: ComponentFixture<OrderHistoryComponent>;
  let orderService: jasmine.SpyObj<OrderService>;

  const mockOrders: Order[] = [
    {
      id: 1,
      userId: 1,
      userName: 'John Doe',
      userEmail: 'john@test.com',
      items: [
        {
          id: 1,
          menuItemId: 1,
          menuItemName: 'Burger',
          quantity: 2,
          price: 12.99
        }
      ],
      totalAmount: 25.98,
      status: 'DELIVERED',
      orderDate: new Date(),
      createdAt: new Date()
    },
    {
      id: 2,
      userId: 1,
      userName: 'John Doe',
      userEmail: 'john@test.com',
      items: [
        {
          id: 2,
          menuItemId: 2,
          menuItemName: 'Pizza',
          quantity: 1,
          price: 15.99
        }
      ],
      totalAmount: 15.99,
      status: 'PENDING',
      orderDate: new Date(),
      createdAt: new Date()
    }
  ];

  beforeEach(async () => {
    const orderSpy = jasmine.createSpyObj('OrderService', ['getMyOrders', 'cancelOrder']);

    await TestBed.configureTestingModule({
      imports: [OrderHistoryComponent],
      providers: [
        { provide: OrderService, useValue: orderSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderHistoryComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    orderService.getMyOrders.and.returnValue(of(mockOrders));
    
    component.ngOnInit();
    
    expect(orderService.getMyOrders).toHaveBeenCalled();
    expect(component.orders).toEqual(mockOrders);
    expect(component.loading).toBeFalsy();
  });

  it('should filter orders by status', () => {
    component.orders = mockOrders;
    component.selectedStatus = 'PENDING';
    
    component.filterOrders();
    
    expect(component.filteredOrders.length).toBe(1);
    expect(component.filteredOrders[0].status).toBe('PENDING');
  });

  it('should filter orders by timeframe', () => {
    component.orders = mockOrders;
    component.selectedTimeframe = 'today';
    
    component.filterOrders();
    
    expect(component.filteredOrders.length).toBe(2); // Both orders are from today
  });

  it('should cancel order successfully', () => {
    const cancelledOrder = { ...mockOrders[1], status: 'CANCELLED' as any };
    orderService.cancelOrder.and.returnValue(of(cancelledOrder));
    spyOn(window, 'confirm').and.returnValue(true);
    component.orders = [...mockOrders];
    
    component.cancelOrder(mockOrders[1]);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(orderService.cancelOrder).toHaveBeenCalledWith(2);
  });

  it('should get correct status class', () => {
    expect(component.getStatusClass('PENDING')).toBe('status-pending');
    expect(component.getStatusClass('DELIVERED')).toBe('status-delivered');
    expect(component.getStatusClass('CANCELLED')).toBe('status-cancelled');
  });

  it('should get correct status icon', () => {
    expect(component.getStatusIcon('PENDING')).toBe('⏳');
    expect(component.getStatusIcon('DELIVERED')).toBe('✅');
    expect(component.getStatusIcon('CANCELLED')).toBe('❌');
  });

  it('should check if order can be cancelled', () => {
    expect(component.canCancelOrder('PENDING')).toBeTruthy();
    expect(component.canCancelOrder('CONFIRMED')).toBeTruthy();
    expect(component.canCancelOrder('DELIVERED')).toBeFalsy();
  });

  it('should check if order can be reordered', () => {
    expect(component.canReorder('DELIVERED')).toBeTruthy();
    expect(component.canReorder('CANCELLED')).toBeTruthy();
    expect(component.canReorder('PENDING')).toBeFalsy();
  });

  it('should calculate order statistics correctly', () => {
    component.orders = mockOrders;
    const stats = component.getOrderStats();
    
    expect(stats.total).toBe(2);
    expect(stats.pending).toBe(1);
    expect(stats.completed).toBe(1);
    expect(stats.cancelled).toBe(0);
    expect(stats.totalSpent).toBe(25.98);
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(25.98);
    expect(formatted).toBe('$25.98');
  });

  it('should get total item count', () => {
    const count = component.getTotalItemCount(mockOrders[0]);
    expect(count).toBe(2);
  });

  it('should get order summary', () => {
    const summary = component.getOrderSummary(mockOrders[0]);
    expect(summary).toBe('Burger');
  });

  it('should handle error when loading orders', () => {
    orderService.getMyOrders.and.returnValue(throwError(() => new Error('API Error')));
    
    component.ngOnInit();
    
    expect(component.error).toBe('Failed to load your orders');
    expect(component.loading).toBeFalsy();
  });
});