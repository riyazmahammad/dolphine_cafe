export interface MenuItem {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  ingredients?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}