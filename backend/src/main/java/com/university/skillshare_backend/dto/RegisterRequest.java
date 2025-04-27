package com.university.skillshare_backend.dto;

import java.util.List;
import com.university.skillshare_backend.model.User;

public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private String bio;
    private User.UserRole role;
    private List<String> specializations;
    
    // Getters and setters
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public User.UserRole getRole() {
        return role;
    }
    
    public void setRole(User.UserRole role) {
        this.role = role;
    }
    
    public List<String> getSpecializations() {
        return specializations;
    }
    
    public void setSpecializations(List<String> specializations) {
        this.specializations = specializations;
    }
}
