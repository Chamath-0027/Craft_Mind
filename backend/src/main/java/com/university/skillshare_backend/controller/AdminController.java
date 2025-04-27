package com.university.skillshare_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.university.skillshare_backend.model.User;
import com.university.skillshare_backend.repository.UserRepository;
import com.university.skillshare_backend.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private UserRepository userRepository;
    
    @PutMapping("/users/{userId}/verify")
    public ResponseEntity<?> verifyUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        user.setVerified(true);
        userRepository.save(user);
        
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable String userId,
            @RequestParam User.UserRole newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        user.setRole(newRole);
        userRepository.save(user);
        
        return ResponseEntity.ok().build();
    }
}
