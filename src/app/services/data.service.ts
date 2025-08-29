import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { MenuItem } from '../models/menu.model';
import { Order, CreateOrderRequest } from '../models/order.model';

interface LocalData {
  users: User[];
  menuItems: MenuItem[];
  orders: Order[];
  nextUserId: number;
  nextMenuItemId: number;
  nextOrderId: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly STORAGE_KEY = 'cafeteria_data';
  private data: LocalData;
  
  // Subjects for reactive data
  private usersSubject = new BehaviorSubject<User[]>([]);
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  private ordersSubject = new BehaviorSubject<Order[]>([]);

  public users$ = this.usersSubject.asObservable();
  public menuItems$ = this.menuItemsSubject.asObservable();
  public orders$ = this.ordersSubject.asObservable();

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    
    if (storedData) {
      this.data = JSON.parse(storedData);
      // Convert date strings back to Date objects
      this.data.orders.forEach(order => {
        order.orderDate = new Date(order.orderDate);
        if (order.createdAt) order.createdAt = new Date(order.createdAt);
        if (order.updatedAt) order.updatedAt = new Date(order.updatedAt);
        if (order.estimatedTime) order.estimatedTime = new Date(order.estimatedTime);
      });
      this.data.users.forEach(user => {
        if (user.createdAt) user.createdAt = new Date(user.createdAt);
      });
      this.data.menuItems.forEach(item => {
        if (item.createdAt) item.createdAt = new Date(item.createdAt);
        if (item.updatedAt) item.updatedAt = new Date(item.updatedAt);
      });
    } else {
      this.initializeDefaultData();
    }
    
    this.updateSubjects();
  }

  private initializeDefaultData(): void {
    this.data = {
      users: [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@cafe.com',
          role: 'ADMIN',
          department: 'Management',
          phone: '+1234567890',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 2,
          name: 'John Employee',
          email: 'john@cafe.com',
          role: 'EMPLOYEE',
          department: 'Engineering',
          phone: '+1234567891',
          isActive: true,
          createdAt: new Date()
        }
      ],
      menuItems: [
        {
          id: 1,
          name: 'Classic Burger',
          description: 'Juicy beef patty with lettuce, tomato, and our special sauce',
          price: 12.99,
          category: 'Main Course',
          imageUrl: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
          isAvailable: true,
          preparationTime: 15,
          ingredients: ['beef patty', 'lettuce', 'tomato', 'special sauce', 'bun'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          name: 'Margherita Pizza',
          description: 'Fresh mozzarella, tomato sauce, and basil on crispy crust',
          price: 14.99,
          category: 'Main Course',
          imageUrl: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
          isAvailable: true,
          preparationTime: 20,
          ingredients: ['mozzarella', 'tomato sauce', 'basil', 'pizza dough'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          name: 'Caesar Salad',
          description: 'Crisp romaine lettuce with parmesan cheese and croutons',
          price: 8.99,
          category: 'Salads',
          imageUrl: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
          isAvailable: true,
          preparationTime: 10,
          ingredients: ['romaine lettuce', 'parmesan cheese', 'croutons', 'caesar dressing'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 4,
          name: 'Fresh Coffee',
          description: 'Freshly brewed coffee from premium beans',
          price: 3.99,
          category: 'Beverages',
          imageUrl: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg',
          isAvailable: true,
          preparationTime: 5,
          ingredients: ['coffee beans', 'water'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 5,
          name: 'Chocolate Cake',
          description: 'Rich chocolate cake with creamy frosting',
          price: 6.99,
          category: 'Desserts',
          imageUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
          isAvailable: true,
          preparationTime: 5,
          ingredients: ['chocolate', 'flour', 'eggs', 'butter', 'sugar'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      orders: [],
      nextUserId: 3,
      nextMenuItemId: 6,
      nextOrderId: 1
    };
    
    this.saveData();
  }

  private saveData(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  private updateSubjects(): void {
    this.usersSubject.next([...this.data.users]);
    this.menuItemsSubject.next([...this.data.menuItems]);
    this.ordersSubject.next([...this.data.orders]);
  }

  private simulateNetworkDelay(): Observable<any> {
    return of(null).pipe(delay(Math.random() * 500 + 200));
  }

  // User Management
  createUser(userData: any): Observable<{ message: string }> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        // Check if email already exists
        if (this.data.users.some(user => user.email === userData.email)) {
          throw new Error('Email already exists');
        }

        const newUser: User = {
          id: this.data.nextUserId++,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'EMPLOYEE',
          department: userData.department,
          phone: userData.phone,
          isActive: true,
          createdAt: new Date()
        };

        this.data.users.push(newUser);
        this.saveData();
        this.updateSubjects();

        return { message: 'User registered successfully. You can now login.' };
      })
    );
  }

  authenticateUser(email: string, password: string): Observable<{ token: string; user: User; message: string }> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        const user = this.data.users.find(u => u.email === email);
        
        if (!user) {
          throw new Error('User not found');
        }

        if (!user.isActive) {
          throw new Error('Account is not active');
        }

        // In a real app, you'd verify the password hash
        // For demo purposes, we'll accept any password for existing users
        const token = `mock_token_${user.id}_${Date.now()}`;

        return {
          token,
          user,
          message: 'Login successful'
        };
      })
    );
  }

  getUserById(id: number): Observable<User | null> {
    return of(this.data.users.find(user => user.id === id) || null);
  }

  // Menu Management
  getMenuItems(): Observable<MenuItem[]> {
    return this.simulateNetworkDelay().pipe(
      map(() => [...this.data.menuItems])
    );
  }

  getMenuItemById(id: number): Observable<MenuItem | null> {
    return this.simulateNetworkDelay().pipe(
      map(() => this.data.menuItems.find(item => item.id === id) || null)
    );
  }

  getMenuByCategories(): Observable<{ name: string; items: MenuItem[] }[]> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        const categories = [...new Set(this.data.menuItems.map(item => item.category))];
        return categories.map(category => ({
          name: category,
          items: this.data.menuItems.filter(item => item.category === category && item.isAvailable)
        }));
      })
    );
  }

  createMenuItem(itemData: any): Observable<MenuItem> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        const newItem: MenuItem = {
          id: this.data.nextMenuItemId++,
          name: itemData.name,
          description: itemData.description,
          price: parseFloat(itemData.price),
          category: itemData.category,
          imageUrl: itemData.imageUrl,
          isAvailable: itemData.isAvailable !== false,
          preparationTime: parseInt(itemData.preparationTime) || 15,
          ingredients: Array.isArray(itemData.ingredients) ? itemData.ingredients : [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.data.menuItems.push(newItem);
        this.saveData();
        this.updateSubjects();

        return newItem;
      })
    );
  }

  updateMenuItem(id: number, itemData: any): Observable<MenuItem> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        const index = this.data.menuItems.findIndex(item => item.id === id);
        
        if (index === -1) {
          throw new Error('Menu item not found');
        }

        const updatedItem: MenuItem = {
          ...this.data.menuItems[index],
          name: itemData.name,
          description: itemData.description,
          price: parseFloat(itemData.price),
          category: itemData.category,
          imageUrl: itemData.imageUrl,
          isAvailable: itemData.isAvailable !== false,
          preparationTime: parseInt(itemData.preparationTime) || 15,
          ingredients: Array.isArray(itemData.ingredients) ? itemData.ingredients : [],
          updatedAt: new Date()
        };

        this.data.menuItems[index] = updatedItem;
        this.saveData();
        this.updateSubjects();

        return updatedItem;
      })
    );
  }

  deleteMenuItem(id: number): Observable<void> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        const index = this.data.menuItems.findIndex(item => item.id === id);
        
        if (index === -1) {
          throw new Error('Menu item not found');
        }

        this.data.menuItems.splice(index, 1);
        this.saveData();
        this.updateSubjects();
      })
    );
  }

  toggleMenuItemAvailability(id: number): Observable<MenuItem> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        const index = this.data.menuItems.findIndex(item => item.id === id);
        
        if (index === -1) {
          throw new Error('Menu item not found');
        }

        this.data.menuItems[index].isAvailable = !this.data.menuItems[index].isAvailable;
        this.data.menuItems[index].updatedAt = new Date();
        
        this.saveData();
        this.updateSubjects();

        return this.data.menuItems[index];
      })
    );
  }

  // Order Management
  createOrder(orderRequest: CreateOrderRequest, userId: number): Observable<Order> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        const user = this.data.users.find(u => u.id === userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Calculate total and prepare order items
        let totalAmount = 0;
        const orderItems = orderRequest.items.map(item => {
          const menuItem = this.data.menuItems.find(mi => mi.id === item.menuItemId);
          if (!menuItem) {
            throw new Error(`Menu item with ID ${item.menuItemId} not found`);
          }
          if (!menuItem.isAvailable) {
            throw new Error(`${menuItem.name} is currently unavailable`);
          }

          const itemTotal = menuItem.price * item.quantity;
          totalAmount += itemTotal;

          return {
            id: Date.now() + Math.random(), // Simple ID generation
            menuItemId: item.menuItemId,
            menuItemName: menuItem.name,
            quantity: item.quantity,
            price: menuItem.price,
            specialInstructions: item.specialInstructions
          };
        });

        const newOrder: Order = {
          id: this.data.nextOrderId++,
          userId: user.id!,
          userName: user.name,
          userEmail: user.email,
          items: orderItems,
          totalAmount,
          status: 'PENDING',
          orderDate: new Date(),
          specialInstructions: orderRequest.specialInstructions,
          paymentStatus: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Calculate estimated time
        const totalPrepTime = orderItems.reduce((total, item) => {
          const menuItem = this.data.menuItems.find(mi => mi.id === item.menuItemId);
          return total + (menuItem?.preparationTime || 15) * item.quantity;
        }, 0);
        
        newOrder.estimatedTime = new Date(Date.now() + totalPrepTime * 60000);

        this.data.orders.push(newOrder);
        this.saveData();
        this.updateSubjects();

        return newOrder;
      })
    );
  }

  getOrdersByUser(userId: number): Observable<Order[]> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        return this.data.orders
          .filter(order => order.userId === userId)
          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      })
    );
  }

  getAllOrders(): Observable<Order[]> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        return [...this.data.orders].sort((a, b) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
      })
    );
  }

  getOrderById(id: number): Observable<Order | null> {
    return this.simulateNetworkDelay().pipe(
      map(() => this.data.orders.find(order => order.id === id) || null)
    );
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        const index = this.data.orders.findIndex(order => order.id === id);
        
        if (index === -1) {
          throw new Error('Order not found');
        }

        this.data.orders[index].status = status as any;
        this.data.orders[index].updatedAt = new Date();

        // Update estimated time based on status
        if (status === 'CONFIRMED') {
          const totalPrepTime = this.data.orders[index].items.reduce((total, item) => {
            const menuItem = this.data.menuItems.find(mi => mi.id === item.menuItemId);
            return total + (menuItem?.preparationTime || 15) * item.quantity;
          }, 0);
          this.data.orders[index].estimatedTime = new Date(Date.now() + totalPrepTime * 60000);
        }

        this.saveData();
        this.updateSubjects();

        return this.data.orders[index];
      })
    );
  }

  cancelOrder(id: number): Observable<Order> {
    return this.updateOrderStatus(id, 'CANCELLED');
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        return this.data.orders
          .filter(order => order.status === status)
          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      })
    );
  }

  getTodayOrders(): Observable<Order[]> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.data.orders
          .filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate >= today && orderDate < tomorrow;
          })
          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      })
    );
  }

  // Utility methods
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeDefaultData();
    this.updateSubjects();
  }

  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData: string): Observable<{ message: string }> {
    try {
      const importedData = JSON.parse(jsonData);
      
      // Validate data structure
      if (!importedData.users || !importedData.menuItems || !importedData.orders) {
        throw new Error('Invalid data format');
      }

      this.data = importedData;
      this.saveData();
      this.updateSubjects();

      return of({ message: 'Data imported successfully' });
    } catch (error) {
      return throwError(() => new Error('Failed to import data: Invalid JSON format'));
    }
  }

  // Statistics
  getStatistics(): Observable<any> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        const totalOrders = this.data.orders.length;
        const pendingOrders = this.data.orders.filter(o => 
          ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status)
        ).length;
        const completedOrders = this.data.orders.filter(o => o.status === 'DELIVERED').length;
        const totalRevenue = this.data.orders
          .filter(o => o.status === 'DELIVERED')
          .reduce((sum, order) => sum + order.totalAmount, 0);
        const activeMenuItems = this.data.menuItems.filter(item => item.isAvailable).length;

        return {
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
          activeMenuItems,
          totalUsers: this.data.users.length,
          activeUsers: this.data.users.filter(u => u.isActive).length
        };
      })
    );
  }

  // Search functionality
  searchMenuItems(query: string): Observable<MenuItem[]> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        const searchTerm = query.toLowerCase();
        return this.data.menuItems.filter(item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm) ||
          item.ingredients?.some(ing => ing.toLowerCase().includes(searchTerm))
        );
      })
    );
  }

  searchOrders(query: string): Observable<Order[]> {
    return this.simulateNetworkDelay().pipe(
      map(() => {
        const searchTerm = query.toLowerCase();
        return this.data.orders.filter(order =>
          order.userName.toLowerCase().includes(searchTerm) ||
          order.userEmail.toLowerCase().includes(searchTerm) ||
          order.id?.toString().includes(searchTerm) ||
          order.items.some(item => item.menuItemName.toLowerCase().includes(searchTerm))
        );
      })
    );
  }
}