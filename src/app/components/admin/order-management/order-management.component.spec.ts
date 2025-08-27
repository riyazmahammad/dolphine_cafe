import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { OrderManagementComponent } from './order-management.component';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

describe('OrderManagementComponent', () => {
  let component: OrderManagementComponent;
  let fixture: ComponentFixture<OrderManagementComponent>;
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
      status: 'PENDING',
      orderDate: new Date(),
      createdAt: new Date()
    }
  ];

  beforeEach(async () => {
    const orderSpy = jasmine.createSpyObj('OrderService', ['getAllOrders', 'updateOrderStatus']);

    await TestBed.configureTestingModule({
      imports: [OrderManagementComponent],
      providers: [
        { provide: OrderService, useValue: orderSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderManagementComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    orderService.getAllOrders.and.returnValue(of(mockOrders));
    
    component.ngOnInit();
    
    expect(orderService.getAllOrders).toHaveBeenCalled();
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

  it('should update order status', () => {
    const updatedOrder = { ...mockOrders[0], status: 'CONFIRMED' as any };
    orderService.updateOrderStatus.and.returnValue(of(updatedOrder));
    component.orders = [...mockOrders];
    
    component.updateOrderStatus(mockOrders[0], 'CONFIRMED');
    
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith(1, 'CONFIRMED');
  });

  it('should get correct status class', () => {
    expect(component.getStatusClass('PENDING')).toBe('status-pending');
    expect(component.getStatusClass('READY')).toBe('status-ready');
    expect(component.getStatusClass('DELIVERED')).toBe('status-delivered');
  });

  it('should get next status correctly', () => {
    expect(component.getNextStatus('PENDING')).toBe('CONFIRMED');
    expect(component.getNextStatus('CONFIRMED')).toBe('PREPARING');
    expect(component.getNextStatus('DELIVERED')).toBeNull();
  });

  it('should check if status can be advanced', () => {
    expect(component.canAdvanceStatus('PENDING')).toBeTruthy();
    expect(component.canAdvanceStatus('DELIVERED')).toBeFalsy();
  });

  it('should check if order can be cancelled', () => {
    expect(component.canCancelOrder('PENDING')).toBeTruthy();
    expect(component.canCancelOrder('DELIVERED')).toBeFalsy();
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(25.98);
    expect(formatted).toBe('$25.98');
  });

  it('should get total item count', () => {
    const count = component.getTotalItemCount(mockOrders[0]);
    expect(count).toBe(2);
  });
});