import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MenuService } from '../../../services/menu.service';
import { MenuItem } from '../../../models/menu.model';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './menu-management.component.html',
  styleUrl: './menu-management.component.css'
})
export class MenuManagementComponent implements OnInit {
  menuItems: MenuItem[] = [];
  filteredItems: MenuItem[] = [];
  categories: string[] = [];
  selectedCategory = 'All';
  searchTerm = '';
  
  showAddForm = false;
  editingItem: MenuItem | null = null;
  menuForm!: FormGroup;
  
  loading = true;
  submitting = false;
  error = '';
  successMessage = '';
  errorMessage: any;

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadMenuItems();
  }

  initializeForm(): void {
    this.menuForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', [Validators.required]],
      imageUrl: [''],
      preparationTime: [15, [Validators.required, Validators.min(1)]],
      ingredients: [''],
      isAvailable: [true]
    });
  }

  loadMenuItems(): void {
    this.loading = true;
    this.menuService.getMenuItems().subscribe({
      next: (items) => {
        this.menuItems = items;
        this.filteredItems = items;
        this.extractCategories();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load menu items';
        this.loading = false;
      }
    });
  }

  extractCategories(): void {
    const categorySet = new Set(this.menuItems.map(item => item.category));
    this.categories = ['All', ...Array.from(categorySet)];
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
        item.category.toLowerCase().includes(term)
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

  showAddItemForm(): void {
    this.showAddForm = true;
    this.editingItem = null;
    this.menuForm.reset({
      preparationTime: 15,
      isAvailable: true
    });
  }

  editItem(item: MenuItem): void {
    this.editingItem = item;
    this.showAddForm = true;
    this.menuForm.patchValue({
      ...item,
      ingredients: item.ingredients?.join(', ') || ''
    });
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingItem = null;
    this.menuForm.reset();
    this.error = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    if (this.menuForm.valid) {
      this.submitting = true;
      this.error = '';

      const formData = { ...this.menuForm.value };
      
      // Process ingredients
      if (formData.ingredients) {
        formData.ingredients = formData.ingredients
          .split(',')
          .map((ingredient: string) => ingredient.trim())
          .filter((ingredient: string) => ingredient.length > 0);
      } else {
        formData.ingredients = [];
      }

      if (this.editingItem) {
        // Update existing item
        this.menuService.updateMenuItem(this.editingItem.id!, formData).subscribe({
          next: (updatedItem) => {
            const index = this.menuItems.findIndex(item => item.id === updatedItem.id);
            if (index !== -1) {
              this.menuItems[index] = updatedItem;
              this.filterItems();
            }
            this.successMessage = 'Menu item updated successfully!';
            this.submitting = false;
            setTimeout(() => this.cancelForm(), 2000);
          },
          error: (error) => {
            this.error = error.error?.message || 'Failed to update menu item';
            this.submitting = false;
          }
        });
      } else {
        // Create new item
        this.menuService.createMenuItem(formData).subscribe({
          next: (newItem) => {
            this.menuItems.push(newItem);
            this.extractCategories();
            this.filterItems();
            this.successMessage = 'Menu item created successfully!';
            this.submitting = false;
            setTimeout(() => this.cancelForm(), 2000);
          },
          error: (error) => {
            this.error = error.error?.message || 'Failed to create menu item';
            this.submitting = false;
          }
        });
      }
    }
  }

  toggleAvailability(item: MenuItem): void {
    this.menuService.toggleAvailability(item.id!).subscribe({
      next: (updatedItem) => {
        const index = this.menuItems.findIndex(i => i.id === updatedItem.id);
        if (index !== -1) {
          this.menuItems[index] = updatedItem;
          this.filterItems();
        }
      },
      error: (error) => {
        this.error = 'Failed to update item availability';
      }
    });
  }

  deleteItem(item: MenuItem): void {
  if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
    this.menuService.deleteMenuItem(item.id!).subscribe({
      next: () => {
        this.menuItems = this.menuItems.filter(i => i.id !== item.id);
        this.extractCategories();
        this.filterItems();
        this.successMessage = 'Menu item deleted successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.error = err.message || 'Failed to delete menu item';
        this.errorMessage = err.message || 'Something went wrong while deleting the menu item';
      }
    });
  }
}

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Form getters
  get name() { return this.menuForm.get('name'); }
  get description() { return this.menuForm.get('description'); }
  get price() { return this.menuForm.get('price'); }
  get category() { return this.menuForm.get('category'); }
  get preparationTime() { return this.menuForm.get('preparationTime'); }
}