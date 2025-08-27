export interface OrderItem {
  id?: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Order {
  id?: number;
  userId: number;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  orderDate: Date;
  estimatedTime?: Date;
  specialInstructions?: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateOrderRequest {
  items: {
    menuItemId: number;
    quantity: number;
    specialInstructions?: string;
  }[];
  specialInstructions?: string;
}