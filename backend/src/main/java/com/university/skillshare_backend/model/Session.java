package com.university.skillshare_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "sessions")
public class Session {
    @Id
    private String id;
    private String userId;
    private String token;
    private String deviceInfo;
    private Date createdAt;
    private boolean isActive;
    private Date expiresAt;

    public Session() {
        this.isActive = true;
    }

    public Session(String userId, String token, String deviceInfo, Date expiresAt) {
        this();
        this.userId = userId;
        this.token = token;
        this.deviceInfo = deviceInfo;
        this.createdAt = new Date();
        this.expiresAt = expiresAt;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean isActive) { this.isActive = isActive; }
    public Date getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Date expiresAt) { this.expiresAt = expiresAt; }
}
