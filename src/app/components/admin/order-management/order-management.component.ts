import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedStatus = 'All';
  selectedDate = '';
  
  statusOptions = ['All', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
  
  loading = true;
  error = '';
  successMessage = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        this.filteredOrders = this.orders;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load orders';
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

    // Filter by date
    if (this.selectedDate) {
      const selectedDate = new Date(this.selectedDate);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.toDateString() === selectedDate.toDateString();
      });
    }

    this.filteredOrders = filtered;
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.filterOrders();
  }

  onDateChange(event: Event): void {
    this.selectedDate = (event.target as HTMLInputElement).value;
    this.filterOrders();
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    this.orderService.updateOrderStatus(order.id!, newStatus).subscribe({
      next: (updatedOrder) => {
        const index = this.orders.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
          this.filterOrders();
        }
        this.successMessage = `Order #${order.id} status updated to ${newStatus}`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.error = 'Failed to update order status';
        setTimeout(() => this.error = '', 3000);
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
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  getNextStatus(currentStatus: string): string | null {
    const statusFlow = {
      'PENDING': 'CONFIRMED',
      'CONFIRMED': 'PREPARING',
      'PREPARING': 'READY',
      'READY': 'DELIVERED'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  }

  canAdvanceStatus(status: string): boolean {
    return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(status);
  }

  canCancelOrder(status: string): boolean {
    return ['PENDING', 'CONFIRMED'].includes(status);
  }

  cancelOrder(order: Order): void {
    if (confirm(`Are you sure you want to cancel order #${order.id}?`)) {
      this.updateOrderStatus(order, 'CANCELLED');
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
}