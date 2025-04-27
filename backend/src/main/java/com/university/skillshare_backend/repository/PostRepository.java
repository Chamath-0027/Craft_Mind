package com.university.skillshare_backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.university.skillshare_backend.model.Post;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    
    // Find posts by userId
    List<Post> findByUserId(String userId);

    // Find posts by userId and order by createdAt descending
    List<Post> findByUserIdOrderByCreatedAtDesc(String userId);
}
