package com.university.skillshare_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.university.skillshare_backend.model.PostInsights;
import com.university.skillshare_backend.service.PostInsightsService;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostInsightsController {
    
    @Autowired
    private PostInsightsService insightsService;

    @GetMapping("/{postId}/insights")
    public ResponseEntity<PostInsights> getInsights(@PathVariable String postId) {
        PostInsights insights = insightsService.getInsights(postId);
        return ResponseEntity.ok(insights);
    }

    @PostMapping("/{postId}/views")
    public ResponseEntity<PostInsights> recordView(
            @PathVariable String postId,
            @RequestParam String viewerId) {
        insightsService.incrementViews(postId, viewerId);
        return ResponseEntity.ok(insightsService.getInsights(postId));
    }
}
