import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { MenuManagementComponent } from './menu-management.component';
import { MenuService } from '../../../services/menu.service';
import { MenuItem } from '../../../models/menu.model';

describe('MenuManagementComponent', () => {
  let component: MenuManagementComponent;
  let fixture: ComponentFixture<MenuManagementComponent>;
  let menuService: jasmine.SpyObj<MenuService>;

  const mockMenuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Burger',
      description: 'Delicious beef burger',
      price: 12.99,
      category: 'Main Course',
      isAvailable: true,
      preparationTime: 15,
      ingredients: ['beef', 'lettuce', 'tomato']
    },
    {
      id: 2,
      name: 'Coffee',
      description: 'Fresh brewed coffee',
      price: 3.99,
      category: 'Beverages',
      isAvailable: true,
      preparationTime: 5
    }
  ];

  beforeEach(async () => {
    const menuSpy = jasmine.createSpyObj('MenuService', [
      'getMenuItems',
      'createMenuItem',
      'updateMenuItem',
      'deleteMenuItem',
      'toggleAvailability'
    ]);

    await TestBed.configureTestingModule({
      imports: [MenuManagementComponent, ReactiveFormsModule],
      providers: [
        { provide: MenuService, useValue: menuSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuManagementComponent);
    component = fixture.componentInstance;
    menuService = TestBed.inject(MenuService) as jasmine.SpyObj<MenuService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load menu items on init', () => {
    menuService.getMenuItems.and.returnValue(of(mockMenuItems));
    
    component.ngOnInit();
    
    expect(menuService.getMenuItems).toHaveBeenCalled();
    expect(component.menuItems).toEqual(mockMenuItems);
    expect(component.loading).toBeFalsy();
  });

  it('should extract categories correctly', () => {
    component.menuItems = mockMenuItems;
    component.extractCategories();
    
    expect(component.categories).toEqual(['All', 'Main Course', 'Beverages']);
  });

  it('should filter items by category', () => {
    component.menuItems = mockMenuItems;
    component.selectedCategory = 'Main Course';
    
    component.filterItems();
    
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].category).toBe('Main Course');
  });

  it('should filter items by search term', () => {
    component.menuItems = mockMenuItems;
    component.searchTerm = 'burger';
    
    component.filterItems();
    
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].name.toLowerCase()).toContain('burger');
  });

  it('should show add form', () => {
    component.showAddItemForm();
    
    expect(component.showAddForm).toBeTruthy();
    expect(component.editingItem).toBeNull();
  });

  it('should edit item', () => {
    const item = mockMenuItems[0];
    component.editItem(item);
    
    expect(component.showAddForm).toBeTruthy();
    expect(component.editingItem).toEqual(item);
  });

  it('should create new menu item', () => {
    const newItem = { ...mockMenuItems[0], id: 3 };
    menuService.createMenuItem.and.returnValue(of(newItem));
    
    component.menuForm.patchValue({
      name: 'Test Item',
      description: 'Test description',
      price: 10.99,
      category: 'Test Category',
      preparationTime: 10,
      isAvailable: true
    });
    
    component.onSubmit();
    
    expect(menuService.createMenuItem).toHaveBeenCalled();
  });

  it('should toggle item availability', () => {
    const updatedItem = { ...mockMenuItems[0], isAvailable: false };
    menuService.toggleAvailability.and.returnValue(of(updatedItem));
    component.menuItems = [...mockMenuItems];
    
    component.toggleAvailability(mockMenuItems[0]);
    
    expect(menuService.toggleAvailability).toHaveBeenCalledWith(1);
  });

  it('should delete item with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    menuService.deleteMenuItem.and.returnValue(of(void 0));
    component.menuItems = [...mockMenuItems];
    
    component.deleteItem(mockMenuItems[0]);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(menuService.deleteMenuItem).toHaveBeenCalledWith(1);
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(12.99);
    expect(formatted).toBe('$12.99');
  });
});