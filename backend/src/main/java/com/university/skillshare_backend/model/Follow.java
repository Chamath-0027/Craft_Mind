package com.university.skillshare_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "follows")
public class Follow {
    @Id
    private String id;
    private String followerId; // User who is following
    private String followedId; // User being followed
    private long createdAt;
    
    public Follow(String followerId, String followedId) {
        this.followerId = followerId;
        this.followedId = followedId;
        this.createdAt = System.currentTimeMillis();
    }
}
