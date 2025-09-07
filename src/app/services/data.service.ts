import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { MenuItem } from '../models/menu.model';
import { Order, CreateOrderRequest } from '../models/order.model';
import { JsonStorageService } from './json-storage.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // Subjects for reactive data
  private usersSubject = new BehaviorSubject<User[]>([]);
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  private ordersSubject = new BehaviorSubject<Order[]>([]);

  public users$ = this.usersSubject.asObservable();
  public menuItems$ = this.menuItemsSubject.asObservable();
  public orders$ = this.ordersSubject.asObservable();

  constructor(private jsonStorage: JsonStorageService) {
    this.initializeDataStreams();
  }

  private initializeDataStreams(): void {
    // Subscribe to JSON file changes and update subjects
    this.jsonStorage.loginData$.subscribe(loginData => {
      if (loginData?.users) {
        this.usersSubject.next(loginData.users);
      }
    });

    this.jsonStorage.productsData$.subscribe(productsData => {
      if (productsData?.menuItems) {
        this.menuItemsSubject.next(productsData.menuItems);
      }
    });

    this.jsonStorage.ordersData$.subscribe(ordersData => {
      if (ordersData?.orders) {
        this.ordersSubject.next(ordersData.orders);
      }
    });
  }

  private simulateNetworkDelay(): Observable<any> {
    return of(null).pipe(
      map(() => Math.random() * 500 + 200),
      switchMap(delay => new Observable(observer => {
        setTimeout(() => {
          observer.next(null);
          observer.complete();
        }, delay);
      }))
    );
  }

  // User Management
  createUser(userData: any): Observable<{ message: string }> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => combineLatest([
        this.jsonStorage.loadLoginData(),
        this.jsonStorage.loadSignupData()
      ])),
      switchMap(([loginData, signupData]) => {
        // Check if email already exists
        if (loginData.users.some((user: any) => user.email === userData.email)) {
          return throwError(() => new Error('Email already exists'));
        }

        const newUser: User = {
          id: loginData.nextUserId++,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'EMPLOYEE',
          department: userData.department,
          phone: userData.phone,
          isActive: false, // User needs to verify email first
          createdAt: new Date()
        };

        // Add user to login data
        loginData.users.push(newUser);
        
        // Generate OTP for email verification
        const otp = this.generateOTP();
        signupData.verificationCodes[userData.email] = {
          code: otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          purpose: 'signup',
          userData: newUser
        };

        // Save both files
        return combineLatest([
          this.jsonStorage.saveLoginData(loginData),
          this.jsonStorage.saveSignupData(signupData)
        ]).pipe(
          map(() => ({ message: `User registered successfully. Please check your email for OTP verification. (Demo OTP: ${otp})` }))
        );
      })
    );
  }

  authenticateUser(email: string, password: string): Observable<{ token: string; user: User; message: string }> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadLoginData()),
      map(loginData => {
        const user = loginData.users.find((u: any) => u.email === email);
        
        if (!user) {
          throw new Error('User not found');
        }

        if (!user.isActive) {
          throw new Error('Account is not active. Please verify your email first.');
        }

        // In a real app, you'd verify the password hash
        // For demo purposes, we'll accept any password for existing users
        const token = `mock_token_${user.id}_${Date.now()}`;

        // Update session in login data
        loginData.sessions[user.id] = {
          token,
          loginTime: new Date(),
          lastActivity: new Date()
        };

        // Save updated login data
        this.jsonStorage.saveLoginData(loginData).subscribe();

        return {
          token,
          user,
          message: 'Login successful'
        };
      })
    );
  }

  // OTP Management
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  verifyOTP(email: string, otp: string): Observable<{ token: string; user: User; message: string }> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => combineLatest([
        this.jsonStorage.loadSignupData(),
        this.jsonStorage.loadLoginData()
      ])),
      switchMap(([signupData, loginData]) => {
        const otpData = signupData.verificationCodes[email];
        
        if (!otpData) {
          return throwError(() => new Error('No OTP found for this email'));
        }

        if (new Date() > new Date(otpData.expiresAt)) {
          delete signupData.verificationCodes[email];
          return this.jsonStorage.saveSignupData(signupData).pipe(
            switchMap(() => throwError(() => new Error('OTP has expired')))
          );
        }

        if (otpData.code !== otp) {
          return throwError(() => new Error('Invalid OTP'));
        }

        // Find and activate user in login data
        const user = loginData.users.find((u: any) => u.email === email);
        if (!user) {
          return throwError(() => new Error('User not found'));
        }

        if (otpData.purpose === 'signup') {
          user.isActive = true;
        }

        // Generate token and session
        const token = `mock_token_${user.id}_${Date.now()}`;
        loginData.sessions[user.id] = {
          token,
          loginTime: new Date(),
          lastActivity: new Date()
        };

        // Clean up OTP
        delete signupData.verificationCodes[email];

        // Save both files
        return combineLatest([
          this.jsonStorage.saveLoginData(loginData),
          this.jsonStorage.saveSignupData(signupData)
        ]).pipe(
          map(() => ({
            token,
            user,
            message: otpData.purpose === 'signup' ? 'Email verified successfully!' : 'OTP verified successfully!'
          }))
        );
      })
    );
  }

  resendOTP(email: string): Observable<{ message: string }> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => combineLatest([
        this.jsonStorage.loadLoginData(),
        this.jsonStorage.loadSignupData()
      ])),
      switchMap(([loginData, signupData]) => {
        const user = loginData.users.find((u: any) => u.email === email);
        if (!user) {
          return throwError(() => new Error('User not found'));
        }

        const otp = this.generateOTP();
        signupData.verificationCodes[email] = {
          code: otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          purpose: user.isActive ? 'reset' : 'signup',
          userData: user
        };
        
        return this.jsonStorage.saveSignupData(signupData).pipe(
          map(() => ({ message: `OTP resent successfully. (Demo OTP: ${otp})` }))
        );
      })
    );
  }

  // Password Reset Management
  initiatePasswordReset(email: string): Observable<{ message: string }> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => combineLatest([
        this.jsonStorage.loadLoginData(),
        this.jsonStorage.loadSignupData()
      ])),
      switchMap(([loginData, signupData]) => {
        const user = loginData.users.find((u: any) => u.email === email);
        if (!user) {
          return throwError(() => new Error('No account found with this email address'));
        }

        const otp = this.generateOTP();
        signupData.verificationCodes[email] = {
          code: otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          purpose: 'reset',
          userData: user
        };
        
        return this.jsonStorage.saveSignupData(signupData).pipe(
          map(() => ({ message: `Password reset OTP sent to your email. (Demo OTP: ${otp})` }))
        );
      })
    );
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<{ message: string }> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => combineLatest([
        this.jsonStorage.loadSignupData(),
        this.jsonStorage.loadLoginData()
      ])),
      switchMap(([signupData, loginData]) => {
        const otpData = signupData.verificationCodes[email];
        
        if (!otpData || otpData.purpose !== 'reset') {
          return throwError(() => new Error('Invalid or expired reset request'));
        }

        if (new Date() > new Date(otpData.expiresAt)) {
          delete signupData.verificationCodes[email];
          return this.jsonStorage.saveSignupData(signupData).pipe(
            switchMap(() => throwError(() => new Error('OTP has expired')))
          );
        }

        if (otpData.code !== otp) {
          return throwError(() => new Error('Invalid OTP'));
        }

        const user = loginData.users.find((u: any) => u.email === email);
        if (!user) {
          return throwError(() => new Error('User not found'));
        }

        // Update password in login data
        user.password = newPassword; // In production, hash this password
        user.updatedAt = new Date();

        // Clean up OTP
        delete signupData.verificationCodes[email];

        // Save both files
        return combineLatest([
          this.jsonStorage.saveLoginData(loginData),
          this.jsonStorage.saveSignupData(signupData)
        ]).pipe(
          map(() => ({ message: 'Password reset successfully! You can now login with your new password.' }))
        );
      })
    );
  }

  getUserById(id: number): Observable<User | null> {
    return this.jsonStorage.loadLoginData().pipe(
      map(loginData => loginData.users.find((user: any) => user.id === id) || null)
    );
  }

  // Menu Management
  getMenuItems(): Observable<MenuItem[]> {
    return this.jsonStorage.loadProductsData().pipe(
      map(productsData => productsData.menuItems || [])
    );
  }

  getMenuItemById(id: number): Observable<MenuItem | null> {
    return this.jsonStorage.loadProductsData().pipe(
      map(productsData => productsData.menuItems.find((item: any) => item.id === id) || null)
    );
  }

  getMenuByCategories(): Observable<{ name: string; items: MenuItem[] }[]> {
    return this.jsonStorage.loadProductsData().pipe(
      map(productsData => {
        const menuItems = productsData.menuItems || [];
        const categories = [...new Set(menuItems.map((item: any) => item.category))];
        return categories.map(category => ({
          name: category,
          items: menuItems.filter((item: any) => item.category === category && item.isAvailable)
        }));
      })
    );
  }

  createMenuItem(itemData: any): Observable<MenuItem> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadProductsData()),
      switchMap(productsData => {
        const newItem: MenuItem = {
          id: productsData.nextMenuItemId++,
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

        productsData.menuItems.push(newItem);
        
        return this.jsonStorage.saveProductsData(productsData).pipe(
          map(() => newItem)
        );
      })
    );
  }

  updateMenuItem(id: number, itemData: any): Observable<MenuItem> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadProductsData()),
      switchMap(productsData => {
        const index = productsData.menuItems.findIndex((item: any) => item.id === id);
        
        if (index === -1) {
          return throwError(() => new Error('Menu item not found'));
        }

        const updatedItem: MenuItem = {
          ...productsData.menuItems[index],
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

        productsData.menuItems[index] = updatedItem;
        
        return this.jsonStorage.saveProductsData(productsData).pipe(
          map(() => updatedItem)
        );
      })
    );
  }

  deleteMenuItem(id: number): Observable<void> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadProductsData()),
      switchMap(productsData => {
        const index = productsData.menuItems.findIndex((item: any) => item.id === id);
        
        if (index === -1) {
          return throwError(() => new Error('Menu item not found'));
        }

        productsData.menuItems.splice(index, 1);
        
        return this.jsonStorage.saveProductsData(productsData).pipe(
          map(() => void 0)
        );
      })
    );
  }

  toggleMenuItemAvailability(id: number): Observable<MenuItem> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadProductsData()),
      switchMap(productsData => {
        const index = productsData.menuItems.findIndex((item: any) => item.id === id);
        
        if (index === -1) {
          return throwError(() => new Error('Menu item not found'));
        }

        productsData.menuItems[index].isAvailable = !productsData.menuItems[index].isAvailable;
        productsData.menuItems[index].updatedAt = new Date();
        
        return this.jsonStorage.saveProductsData(productsData).pipe(
          map(() => productsData.menuItems[index])
        );
      })
    );
  }

  // Order Management
  createOrder(orderRequest: CreateOrderRequest, userId: number): Observable<Order> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => combineLatest([
        this.jsonStorage.loadLoginData(),
        this.jsonStorage.loadProductsData(),
        this.jsonStorage.loadOrdersData()
      ])),
      switchMap(([loginData, productsData, ordersData]) => {
        const user = loginData.users.find((u: any) => u.id === userId);
        if (!user) {
          return throwError(() => new Error('User not found'));
        }

        // Calculate total and prepare order items
        let totalAmount = 0;
        const orderItems = orderRequest.items.map(item => {
          const menuItem = productsData.menuItems.find((mi: any) => mi.id === item.menuItemId);
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
          id: ordersData.nextOrderId++,
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
          const menuItem = productsData.menuItems.find((mi: any) => mi.id === item.menuItemId);
          return total + (menuItem?.preparationTime || 15) * item.quantity;
        }, 0);
        
        newOrder.estimatedTime = new Date(Date.now() + totalPrepTime * 60000);

        ordersData.orders.push(newOrder);
        
        return this.jsonStorage.saveOrdersData(ordersData).pipe(
          map(() => newOrder)
        );
      })
    );
  }

  getOrdersByUser(userId: number): Observable<Order[]> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadOrdersData()),
      map(ordersData => {
        return ordersData.orders
          .filter((order: any) => order.userId === userId)
          .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      })
    );
  }

  getAllOrders(): Observable<Order[]> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadOrdersData()),
      map(ordersData => {
        return [...ordersData.orders].sort((a: any, b: any) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
      })
    );
  }

  getOrderById(id: number): Observable<Order | null> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadOrdersData()),
      map(ordersData => ordersData.orders.find((order: any) => order.id === id) || null)
    );
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadOrdersData()),
      switchMap(ordersData => {
        const index = ordersData.orders.findIndex((order: any) => order.id === id);
        
        if (index === -1) {
          return throwError(() => new Error('Order not found'));
        }

        ordersData.orders[index].status = status as any;
        ordersData.orders[index].updatedAt = new Date();

        // Update estimated time based on status
        if (status === 'CONFIRMED') {
          const totalPrepTime = ordersData.orders[index].items.reduce((total: number, item: any) => {
            return total + (15 * item.quantity); // Default 15 min per item
          }, 0);
          ordersData.orders[index].estimatedTime = new Date(Date.now() + totalPrepTime * 60000);
        }

        return this.jsonStorage.saveOrdersData(ordersData).pipe(
          map(() => ordersData.orders[index])
        );
      })
    );
  }

  cancelOrder(id: number): Observable<Order> {
    return this.updateOrderStatus(id, 'CANCELLED');
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadOrdersData()),
      map(ordersData => {
        return ordersData.orders
          .filter((order: any) => order.status === status)
          .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      })
    );
  }

  getTodayOrders(): Observable<Order[]> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadOrdersData()),
      map(ordersData => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return ordersData.orders
          .filter((order: any) => {
            const orderDate = new Date(order.orderDate);
            return orderDate >= today && orderDate < tomorrow;
          })
          .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      })
    );
  }

  // Statistics
  getStatistics(): Observable<any> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => combineLatest([
        this.jsonStorage.loadOrdersData(),
        this.jsonStorage.loadProductsData(),
        this.jsonStorage.loadLoginData()
      ])),
      map(([ordersData, productsData, loginData]) => {
        const orders = ordersData.orders || [];
        const menuItems = productsData.menuItems || [];
        const users = loginData.users || [];

        const totalOrders = orders.length;
        const pendingOrders = orders.filter((o: any) => 
          ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status)
        ).length;
        const completedOrders = orders.filter((o: any) => o.status === 'DELIVERED').length;
        const totalRevenue = orders
          .filter((o: any) => o.status === 'DELIVERED')
          .reduce((sum: number, order: any) => sum + order.totalAmount, 0);
        const activeMenuItems = menuItems.filter((item: any) => item.isAvailable).length;

        return {
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
          activeMenuItems,
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.isActive).length
        };
      })
    );
  }

  // Search functionality
  searchMenuItems(query: string): Observable<MenuItem[]> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadProductsData()),
      map(productsData => {
        const searchTerm = query.toLowerCase();
        return productsData.menuItems.filter((item: any) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm) ||
          item.ingredients?.some((ing: string) => ing.toLowerCase().includes(searchTerm))
        );
      })
    );
  }

  searchOrders(query: string): Observable<Order[]> {
    return this.simulateNetworkDelay().pipe(
      switchMap(() => this.jsonStorage.loadOrdersData()),
      map(ordersData => {
        const searchTerm = query.toLowerCase();
        return ordersData.orders.filter((order: any) =>
          order.userName.toLowerCase().includes(searchTerm) ||
          order.userEmail.toLowerCase().includes(searchTerm) ||
          order.id?.toString().includes(searchTerm) ||
          order.items.some((item: any) => item.menuItemName.toLowerCase().includes(searchTerm))
        );
      })
    );
  }

  // Utility methods
  clearAllData(): Observable<{ message: string }> {
    const defaultLoginData = {
      users: [],
      sessions: {},
      otpCodes: {},
      passwordResetTokens: {},
      nextUserId: 1
    };

    const defaultSignupData = {
      pendingUsers: [],
      verificationCodes: {},
      signupAttempts: {}
    };

    const defaultProductsData = {
      menuItems: [],
      categories: [],
      nextMenuItemId: 1
    };

    const defaultOrdersData = {
      orders: [],
      nextOrderId: 1,
      orderStatuses: ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"]
    };

    return combineLatest([
      this.jsonStorage.saveLoginData(defaultLoginData),
      this.jsonStorage.saveSignupData(defaultSignupData),
      this.jsonStorage.saveProductsData(defaultProductsData),
      this.jsonStorage.saveOrdersData(defaultOrdersData)
    ]).pipe(
      map(() => ({ message: 'All data cleared successfully' }))
    );
  }

  exportData(): Observable<string> {
    return combineLatest([
      this.jsonStorage.loadLoginData(),
      this.jsonStorage.loadSignupData(),
      this.jsonStorage.loadProductsData(),
      this.jsonStorage.loadOrdersData()
    ]).pipe(
      map(([loginData, signupData, productsData, ordersData]) => {
        const exportData = {
          login: loginData,
          signup: signupData,
          products: productsData,
          orders: ordersData,
          exportedAt: new Date()
        };
        return JSON.stringify(exportData, null, 2);
      })
    );
  }
}