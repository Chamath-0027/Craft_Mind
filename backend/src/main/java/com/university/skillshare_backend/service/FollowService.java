package com.university.skillshare_backend.service;

import com.university.skillshare_backend.model.Follow;
import com.university.skillshare_backend.model.User;
import com.university.skillshare_backend.repository.FollowRepository;
import com.university.skillshare_backend.repository.UserRepository;
import com.university.skillshare_backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public FollowService(FollowRepository followRepository, 
                        UserRepository userRepository,
                        NotificationService notificationService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Follow followUser(String followerId, String followedId) {
        // Check if users exist
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", followerId));
        User followed = userRepository.findById(followedId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", followedId));

        // Check if already following
        if (followRepository.existsByFollowerIdAndFollowedId(followerId, followedId)) {
            throw new IllegalStateException("Already following this user");
        }

        // Create follow relationship
        Follow follow = new Follow(followerId, followedId);
        Follow savedFollow = followRepository.save(follow);

        // Send notification
        notificationService.createNotification(
            followedId,
            "New Follower",
            follower.getUsername() + " started following you",
            com.university.skillshare_backend.model.Notification.NotificationType.FOLLOW,
            followerId
        );

        return savedFollow;
    }

    public void unfollowUser(String followerId, String followedId) {
        // Verify users exist
        userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", followerId));
        userRepository.findById(followedId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", followedId));

        followRepository.deleteByFollowerIdAndFollowedId(followerId, followedId);
    }

    public List<User> getFollowers(String userId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return followRepository.findByFollowedId(userId)
                .stream()
                .map(follow -> userRepository.findById(follow.getFollowerId())
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", follow.getFollowerId())))
                .collect(Collectors.toList());
    }

    public List<User> getFollowing(String userId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return followRepository.findByFollowerId(userId)
                .stream()
                .map(follow -> userRepository.findById(follow.getFollowedId())
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", follow.getFollowedId())))
                .collect(Collectors.toList());
    }

    public boolean isFollowing(String followerId, String followedId) {
        return followRepository.existsByFollowerIdAndFollowedId(followerId, followedId);
    }
}
