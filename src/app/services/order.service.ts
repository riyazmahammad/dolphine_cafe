import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order, CreateOrderRequest } from '../models/order.model';
import { DataService } from './data.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  createOrder(orderRequest: CreateOrderRequest): Observable<Order> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }
    return this.dataService.createOrder(orderRequest, currentUser.id);
  }

  getMyOrders(): Observable<Order[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }
    return this.dataService.getOrdersByUser(currentUser.id);
  }

  getAllOrders(): Observable<Order[]> {
    return this.dataService.getAllOrders();
  }

  getOrderById(id: number): Observable<Order> {
    return this.dataService.getOrderById(id).pipe(
      map(order => {
        if (!order) {
          throw new Error('Order not found');
        }
        return order;
      })
    );
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.dataService.updateOrderStatus(id, status);
  }

  cancelOrder(id: number): Observable<Order> {
    return this.dataService.cancelOrder(id);
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.dataService.getOrdersByStatus(status);
  }

  getTodayOrders(): Observable<Order[]> {
    return this.dataService.getTodayOrders();
  }
}