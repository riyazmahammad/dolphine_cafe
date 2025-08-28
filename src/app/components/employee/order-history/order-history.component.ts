import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedStatus = 'All';
  selectedTimeframe = 'All';
  
  statusOptions = ['All', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
  timeframeOptions = [
    { value: 'All', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];
  
  loading = true;
  error = '';
  successMessage = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        this.filteredOrders = this.orders;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load your orders';
        this.loading = false;
      }
    });
  }

  filterOrders(): void {
    let filtered = this.orders;

    // Filter by status
    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    // Filter by timeframe
    if (this.selectedTimeframe !== 'All') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        
        switch (this.selectedTimeframe) {
          case 'today':
            return orderDate >= startOfDay;
          case 'week':
            return orderDate >= startOfWeek;
          case 'month':
            return orderDate >= startOfMonth;
          default:
            return true;
        }
      });
    }

    this.filteredOrders = filtered;
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.filterOrders();
  }

  onTimeframeChange(timeframe: string): void {
    this.selectedTimeframe = timeframe;
    this.filterOrders();
  }

  cancelOrder(order: Order): void {
    if (!this.canCancelOrder(order.status)) {
      return;
    }

    if (confirm(`Are you sure you want to cancel order #${order.id}?`)) {
      this.orderService.cancelOrder(order.id!).subscribe({
        next: (updatedOrder) => {
          const index = this.orders.findIndex(o => o.id === updatedOrder.id);
          if (index !== -1) {
            this.orders[index] = updatedOrder;
            this.filterOrders();
          }
          this.successMessage = `Order #${order.id} has been cancelled`;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.error = 'Failed to cancel order';
          setTimeout(() => this.error = '', 3000);
        }
      });
    }
  }

  reorderItems(order: Order): void {
    // This would typically navigate to the menu with pre-filled cart
    // For now, we'll show a message
    this.successMessage = 'Reorder functionality would redirect to menu with these items pre-selected';
    setTimeout(() => this.successMessage = '', 3000);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-confirmed';
      case 'PREPARING': return 'status-preparing';
      case 'READY': return 'status-ready';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'CONFIRMED': return '✅';
      case 'PREPARING': return '👨‍🍳';
      case 'READY': return '🔔';
      case 'DELIVERED': return '✅';
      case 'CANCELLED': return '❌';
      default: return '📋';
    }
  }

  canCancelOrder(status: string): boolean {
    return ['PENDING', 'CONFIRMED'].includes(status);
  }

  canReorder(status: string): boolean {
    return ['DELIVERED', 'CANCELLED'].includes(status);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getOrderSummary(order: Order): string {
    const itemCount = order.items.length;
    const firstItem = order.items[0]?.menuItemName || '';
    
    if (itemCount === 1) {
      return firstItem;
    } else if (itemCount === 2) {
      return `${firstItem} and 1 other item`;
    } else {
      return `${firstItem} and ${itemCount - 1} other items`;
    }
  }

  getTotalItemCount(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  getEstimatedTime(order: Order): string {
    if (order.estimatedTime) {
      return this.formatTime(order.estimatedTime);
    }
    
    // Calculate estimated time based on preparation time
    const totalPrepTime = order.items.reduce((total, item) => {
      return total + (15 * item.quantity); // Assuming 15 min per item
    }, 0);
    
    const estimatedTime = new Date(order.orderDate);
    estimatedTime.setMinutes(estimatedTime.getMinutes() + totalPrepTime);
    
    return this.formatTime(estimatedTime);
  }

  getOrderStats() {
    return {
      total: this.orders.length,
      pending: this.orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status)).length,
      completed: this.orders.filter(o => o.status === 'DELIVERED').length,
      cancelled: this.orders.filter(o => o.status === 'CANCELLED').length,
      totalSpent: this.orders
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, order) => sum + order.totalAmount, 0)
    };
  }
}