import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { MenuService } from '../../../services/menu.service';
import { DataService } from '../../../services/data.service';
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
    private menuService: MenuService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load statistics from data service
    this.dataService.getStatistics().subscribe({
      next: (stats) => {
        this.stats = {
          totalOrders: stats.totalOrders,
          pendingOrders: stats.pendingOrders,
          completedOrders: stats.completedOrders,
          totalRevenue: stats.totalRevenue,
          activeMenuItems: stats.activeMenuItems
        };
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });

    // Load recent orders
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.recentOrders = orders.slice(0, 5);
      },
      error: (error) => {
        console.error('Failed to load recent orders:', error);
      }
    });
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