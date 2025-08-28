package com.cafeteria.repository;

import com.cafeteria.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByIsAvailableTrue();
    List<MenuItem> findByCategory(String category);
    
    @Query("SELECT DISTINCT m.category FROM MenuItem m ORDER BY m.category")
    List<String> findDistinctCategories();
}