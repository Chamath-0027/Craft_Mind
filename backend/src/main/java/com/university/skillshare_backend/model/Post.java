package com.university.skillshare_backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    private String userId;
    private String title;
    private String content;
    private String imageUrl;
    private String videoUrl;
    private LocalDateTime createdAt;
    
    // Default constructor
    public Post() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Constructor with userId, title and content
    public Post(String userId, String title, String content) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }

    // Getter/setter for videoUrl
    public String getVideoUrl() {
        return videoUrl;
    }
    
    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
