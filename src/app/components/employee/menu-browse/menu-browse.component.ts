import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MenuService } from '../../../services/menu.service';
import { OrderService } from '../../../services/order.service';
import { MenuItem, MenuCategory } from '../../../models/menu.model';
import { CreateOrderRequest } from '../../../models/order.model';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

@Component({
  selector: 'app-menu-browse',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './menu-browse.component.html',
  styleUrl: './menu-browse.component.css'
})
export class MenuBrowseComponent implements OnInit {
  menuCategories: MenuCategory[] = [];
  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  selectedCategory = 'All';
  searchTerm = '';
  
  cart: CartItem[] = [];
  showCart = false;
  showCheckout = false;
  
  checkoutForm!: FormGroup;
  itemInstructionsForm!: FormGroup;
  editingCartItem: CartItem | null = null;
  
  loading = true;
  submitting = false;
  error = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadMenu();
  }

  initializeForms(): void {
    this.checkoutForm = this.fb.group({
      specialInstructions: ['']
    });

    this.itemInstructionsForm = this.fb.group({
      specialInstructions: ['']
    });
  }

  loadMenu(): void {
    this.loading = true;
    this.menuService.getMenuByCategories().subscribe({
      next: (categories) => {
        this.menuCategories = categories;
        this.menuItems = categories.flatMap(cat => cat.items).filter(item => item.isAvailable);
        this.filteredItems = this.menuItems;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load menu';
        this.loading = false;
      }
    });
  }

  filterItems(): void {
    let filtered = this.menuItems;

    // Filter by category
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.ingredients?.some(ing => ing.toLowerCase().includes(term))
      );
    }

    this.filteredItems = filtered;
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterItems();
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filterItems();
  }

  addToCart(item: MenuItem): void {
    const existingItem = this.cart.find(cartItem => cartItem.menuItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
          this.error = error.message || 'Failed to place order. Please try again.';
        quantity: 1
      });
    }
    
    this.successMessage = `${item.name} added to cart!`;
    setTimeout(() => this.successMessage = '', 2000);
  }

  updateCartItemQuantity(cartItem: CartItem, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(cartItem);
    } else {
      cartItem.quantity = quantity;
    }
  }

  removeFromCart(cartItem: CartItem): void {
    const index = this.cart.findIndex(item => item.menuItem.id === cartItem.menuItem.id);
    if (index !== -1) {
      this.cart.splice(index, 1);
    }
  }

  editCartItemInstructions(cartItem: CartItem): void {
    this.editingCartItem = cartItem;
    this.itemInstructionsForm.patchValue({
      specialInstructions: cartItem.specialInstructions || ''
    });
  }

  saveItemInstructions(): void {
    if (this.editingCartItem) {
      this.editingCartItem.specialInstructions = this.itemInstructionsForm.value.specialInstructions;
      this.editingCartItem = null;
    }
  }

  cancelItemInstructions(): void {
    this.editingCartItem = null;
    this.itemInstructionsForm.reset();
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  }

  getCartItemCount(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  toggleCart(): void {
    this.showCart = !this.showCart;
  }

  proceedToCheckout(): void {
    if (this.cart.length === 0) {
      this.error = 'Your cart is empty';
      return;
    }
    this.showCheckout = true;
    this.showCart = false;
  }

  cancelCheckout(): void {
    this.showCheckout = false;
    this.checkoutForm.reset();
    this.error = '';
  }

  placeOrder(): void {
    if (this.cart.length === 0) {
      this.error = 'Your cart is empty';
      return;
    }

    this.submitting = true;
    this.error = '';

    const orderRequest: CreateOrderRequest = {
      items: this.cart.map(cartItem => ({
        menuItemId: cartItem.menuItem.id!,
        quantity: cartItem.quantity,
        specialInstructions: cartItem.specialInstructions
      })),
      specialInstructions: this.checkoutForm.value.specialInstructions
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (order) => {
        this.submitting = false;
        this.successMessage = `Order #${order.id} placed successfully! You will be notified when it's ready.`;
        this.cart = [];
        this.showCheckout = false;
        this.checkoutForm.reset();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        this.submitting = false;
        this.error = error.error?.message || 'Failed to place order. Please try again.';
      }
    });
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cart = [];
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getCategories(): string[] {
    const categories = ['All', ...new Set(this.menuItems.map(item => item.category))];
    return categories;
  }
}