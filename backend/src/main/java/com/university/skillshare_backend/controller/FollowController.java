package com.university.skillshare_backend.controller;

import com.university.skillshare_backend.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FollowController {

    @Autowired
    private FollowService followService;

    @PostMapping("/users/{userId}/follow")
    public ResponseEntity<?> followUser(@PathVariable String userId, @RequestParam String followerId) {
        return ResponseEntity.ok(followService.followUser(followerId, userId));
    }

    @DeleteMapping("/users/{userId}/unfollow")
    public ResponseEntity<Map<String, String>> unfollowUser(@PathVariable String userId, @RequestParam String followerId) {
        followService.unfollowUser(followerId, userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Successfully unfollowed user");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{userId}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable String userId) {
        return ResponseEntity.ok(followService.getFollowers(userId));
    }

    @GetMapping("/users/{userId}/following")
    public ResponseEntity<?> getFollowing(@PathVariable String userId) {
        return ResponseEntity.ok(followService.getFollowing(userId));
    }

    @GetMapping("/users/{userId}/follow-status")
    public ResponseEntity<?> getFollowStatus(
            @PathVariable String userId,
            @RequestParam String followerId) {
        return ResponseEntity.ok(Map.of(
            "following", followService.isFollowing(followerId, userId)
        ));
    }
}
