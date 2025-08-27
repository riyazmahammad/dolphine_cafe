import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { MenuService } from '../../../services/menu.service';
import { Order } from '../../../models/order.model';
import { MenuItem } from '../../../models/menu.model';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  activeMenuItems: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    activeMenuItems: 0
  };
  
  recentOrders: Order[] = [];
  loading = true;
  error = '';

  constructor(
    private orderService: OrderService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load orders
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.calculateStats(orders);
        this.recentOrders = orders
          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
          .slice(0, 5);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });

    // Load menu items count
    this.menuService.getMenuItems().subscribe({
      next: (items) => {
        this.stats.activeMenuItems = items.filter(item => item.isAvailable).length;
      }
    });
  }

  private calculateStats(orders: Order[]): void {
    this.stats.totalOrders = orders.length;
    this.stats.pendingOrders = orders.filter(o => 
      ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status)
    ).length;
    this.stats.completedOrders = orders.filter(o => 
      o.status === 'DELIVERED'
    ).length;
    this.stats.totalRevenue = orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, order) => sum + order.totalAmount, 0);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-preparing';
      case 'PREPARING': return 'status-preparing';
      case 'READY': return 'status-ready';
      case 'DELIVERED': return 'status-delivered';
      default: return '';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}