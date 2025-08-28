package com.cafeteria.repository;

import com.cafeteria.model.Order;
import com.cafeteria.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByOrderDateDesc(User user);
    List<Order> findByStatusOrderByOrderDateDesc(Order.OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE o.orderDate >= :startDate ORDER BY o.orderDate DESC")
    List<Order> findOrdersFromDate(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT o FROM Order o WHERE DATE(o.orderDate) = CURRENT_DATE ORDER BY o.orderDate DESC")
    List<Order> findTodayOrders();
}