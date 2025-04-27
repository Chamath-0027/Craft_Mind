package com.university.skillshare_backend.dto;

import java.util.List;
import com.university.skillshare_backend.model.User.UserRole;

public class UserUpdateRequest {
    private String username;
    private String email;
    private String fullName;
    private String bio;
    private List<String> specializations;
    private UserRole role;
    
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
    
    public List<String> getSpecializations() {
        return specializations;
    }
    
    public void setSpecializations(List<String> specializations) {
        this.specializations = specializations;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
}
