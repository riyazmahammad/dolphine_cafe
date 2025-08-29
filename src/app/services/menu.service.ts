import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MenuItem, MenuCategory } from '../models/menu.model';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private dataService: DataService) {}

  getMenuItems(): Observable<MenuItem[]> {
    return this.dataService.getMenuItems();
  }

  getMenuItemById(id: number): Observable<MenuItem> {
    return this.dataService.getMenuItemById(id).pipe(
      map(item => {
        if (!item) {
          throw new Error('Menu item not found');
        }
        return item;
      })
    );
  }

  getMenuByCategories(): Observable<MenuCategory[]> {
    return this.dataService.getMenuByCategories();
  }

  createMenuItem(item: MenuItem): Observable<MenuItem> {
    return this.dataService.createMenuItem(item);
  }

  updateMenuItem(id: number, item: MenuItem): Observable<MenuItem> {
    return this.dataService.updateMenuItem(id, item);
  }

  deleteMenuItem(id: number): Observable<void> {
    return this.dataService.deleteMenuItem(id);
  }

  toggleAvailability(id: number): Observable<MenuItem> {
    return this.dataService.toggleMenuItemAvailability(id);
  }

  uploadImage(id: number, file: File): Observable<{ imageUrl: string }> {
    // For local JSON, we'll simulate image upload by returning a placeholder URL
    return new Observable(observer => {
      setTimeout(() => {
        const imageUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg`;
        observer.next({ imageUrl });
        observer.complete();
      }, 1000);
    });
  }
}