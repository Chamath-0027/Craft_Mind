package com.university.skillshare_backend.repository;

import com.university.skillshare_backend.model.Follow;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FollowRepository extends MongoRepository<Follow, String> {
    boolean existsByFollowerIdAndFollowedId(String followerId, String followedId);
    void deleteByFollowerIdAndFollowedId(String followerId, String followedId);
    List<Follow> findByFollowerId(String followerId);
    List<Follow> findByFollowedId(String followedId);
    long countByFollowerId(String followerId);
    long countByFollowedId(String followedId);
}
