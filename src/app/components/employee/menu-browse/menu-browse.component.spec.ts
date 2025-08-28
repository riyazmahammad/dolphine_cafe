import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { MenuBrowseComponent } from './menu-browse.component';
import { MenuService } from '../../../services/menu.service';
import { OrderService } from '../../../services/order.service';
import { MenuCategory } from '../../../models/menu.model';

describe('MenuBrowseComponent', () => {
  let component: MenuBrowseComponent;
  let fixture: ComponentFixture<MenuBrowseComponent>;
  let menuService: jasmine.SpyObj<MenuService>;
  let orderService: jasmine.SpyObj<OrderService>;

  const mockMenuCategories: MenuCategory[] = [
    {
      name: 'Main Course',
      items: [
        {
          id: 1,
          name: 'Burger',
          description: 'Delicious beef burger',
          price: 12.99,
          category: 'Main Course',
          isAvailable: true,
          preparationTime: 15,
          ingredients: ['beef', 'lettuce', 'tomato']
        }
      ]
    }
  ];

  beforeEach(async () => {
    const menuSpy = jasmine.createSpyObj('MenuService', ['getMenuByCategories']);
    const orderSpy = jasmine.createSpyObj('OrderService', ['createOrder']);

    await TestBed.configureTestingModule({
      imports: [MenuBrowseComponent, ReactiveFormsModule],
      providers: [
        { provide: MenuService, useValue: menuSpy },
        { provide: OrderService, useValue: orderSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuBrowseComponent);
    component = fixture.componentInstance;
    menuService = TestBed.inject(MenuService) as jasmine.SpyObj<MenuService>;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load menu on init', () => {
    menuService.getMenuByCategories.and.returnValue(of(mockMenuCategories));
    
    component.ngOnInit();
    
    expect(menuService.getMenuByCategories).toHaveBeenCalled();
    expect(component.menuCategories).toEqual(mockMenuCategories);
    expect(component.loading).toBeFalsy();
  });

  it('should add item to cart', () => {
    const item = mockMenuCategories[0].items[0];
    
    component.addToCart(item);
    
    expect(component.cart.length).toBe(1);
    expect(component.cart[0].menuItem).toEqual(item);
    expect(component.cart[0].quantity).toBe(1);
  });

  it('should increase quantity if item already in cart', () => {
    const item = mockMenuCategories[0].items[0];
    component.cart = [{ menuItem: item, quantity: 1 }];
    
    component.addToCart(item);
    
    expect(component.cart.length).toBe(1);
    expect(component.cart[0].quantity).toBe(2);
  });

  it('should calculate cart total correctly', () => {
    const item = mockMenuCategories[0].items[0];
    component.cart = [{ menuItem: item, quantity: 2 }];
    
    const total = component.getCartTotal();
    
    expect(total).toBe(25.98);
  });

  it('should calculate cart item count correctly', () => {
    const item = mockMenuCategories[0].items[0];
    component.cart = [{ menuItem: item, quantity: 3 }];
    
    const count = component.getCartItemCount();
    
    expect(count).toBe(3);
  });

  it('should remove item from cart', () => {
    const item = mockMenuCategories[0].items[0];
    const cartItem = { menuItem: item, quantity: 1 };
    component.cart = [cartItem];
    
    component.removeFromCart(cartItem);
    
    expect(component.cart.length).toBe(0);
  });

  it('should update cart item quantity', () => {
    const item = mockMenuCategories[0].items[0];
    const cartItem = { menuItem: item, quantity: 1 };
    component.cart = [cartItem];
    
    component.updateCartItemQuantity(cartItem, 3);
    
    expect(cartItem.quantity).toBe(3);
  });

  it('should remove item when quantity is 0', () => {
    const item = mockMenuCategories[0].items[0];
    const cartItem = { menuItem: item, quantity: 1 };
    component.cart = [cartItem];
    
    component.updateCartItemQuantity(cartItem, 0);
    
    expect(component.cart.length).toBe(0);
  });

  it('should filter items by category', () => {
    component.menuItems = mockMenuCategories[0].items;
    component.selectedCategory = 'Main Course';
    
    component.filterItems();
    
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].category).toBe('Main Course');
  });

  it('should filter items by search term', () => {
    component.menuItems = mockMenuCategories[0].items;
    component.searchTerm = 'burger';
    
    component.filterItems();
    
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].name.toLowerCase()).toContain('burger');
  });

  it('should place order successfully', () => {
    const item = mockMenuCategories[0].items[0];
    component.cart = [{ menuItem: item, quantity: 1 }];
    
    const mockOrder = {
      id: 1,
      userId: 1,
      userName: 'Test User',
      userEmail: 'test@test.com',
      items: [],
      totalAmount: 12.99,
      status: 'PENDING' as const,
      orderDate: new Date()
    };
    
    orderService.createOrder.and.returnValue(of(mockOrder));
    
    component.placeOrder();
    
    expect(orderService.createOrder).toHaveBeenCalled();
    expect(component.cart.length).toBe(0);
    expect(component.showCheckout).toBeFalsy();
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(12.99);
    expect(formatted).toBe('$12.99');
  });
});