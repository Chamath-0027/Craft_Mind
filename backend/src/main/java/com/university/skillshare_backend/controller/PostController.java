package com.university.skillshare_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

import com.university.skillshare_backend.exception.ResourceNotFoundException;
import com.university.skillshare_backend.exception.UnauthorizedException;
import com.university.skillshare_backend.model.Post;
import com.university.skillshare_backend.repository.PostRepository;
import com.university.skillshare_backend.repository.UserRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PostController implements WebMvcConfigurer {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public PostController(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Create a new post
     * 
     * @param post Post object from request body
     * @return The created post
     */
    @PostMapping("/posts")
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        // Verify user exists
        userRepository.findById(post.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", post.getUserId()));
            
        Post savedPost = postRepository.save(post);
        return new ResponseEntity<>(savedPost, HttpStatus.CREATED);
    }
    
    /**
     * Get all posts
     * 
     * @return List of posts
     */
    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return ResponseEntity.ok(posts);
    }
    
    /**
     * Get post by ID
     * 
     * @param postId Post ID
     * @return Post details
     */
    @GetMapping("/posts/{postId}") 
    public ResponseEntity<?> getPostById(@PathVariable String postId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new ResourceNotFoundException("Post not found with id : '" + postId + "'"));
            return ResponseEntity.ok(post);
        } catch (ResourceNotFoundException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("status", HttpStatus.NOT_FOUND.value());
            response.put("timestamp", new Date());
            response.put("details", "uri=/api/posts/" + postId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "An unexpected error occurred");
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.put("timestamp", new Date());
            response.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get posts by user ID
     * 
     * @param userId User ID
     * @return List of posts by the user
     */
    @GetMapping("/users/{userId}/posts")
    public ResponseEntity<List<Post>> getPostsByUserId(@PathVariable String userId) {
        try {
            userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                
            List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/posts/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Create unique filename
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            String uploadDir = "uploads/";
            
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            // Save file
            Path path = Paths.get(uploadDir + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            
            // Return URL
            String fileUrl = "/api/uploads/" + fileName;
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }
    
    // Add configuration to serve static files from uploads directory
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable String postId,
            @RequestParam String userId,
            @RequestBody Post updatedPost) {
        try {
            Post existingPost = postRepository.findById(postId)
                    .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
            
            // Verify user exists and ownership
            userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
            if (!existingPost.getUserId().equals(userId)) {
                throw new UnauthorizedException("Not authorized to edit this post");
            }
            
            // Update fields while preserving creation date and ID
            existingPost.setTitle(updatedPost.getTitle());
            existingPost.setContent(updatedPost.getContent());
            
            // Only update image/video URLs if they are provided
            if (updatedPost.getImageUrl() != null) {
                existingPost.setImageUrl(updatedPost.getImageUrl());
            }
            if (updatedPost.getVideoUrl() != null) {
                existingPost.setVideoUrl(updatedPost.getVideoUrl());
            }
            
            // Keep original userId and creation date
            existingPost.setUserId(userId);
            
            Post saved = postRepository.save(existingPost);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(
            @PathVariable String postId,
            @RequestParam String userId) {
        try {
            Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
                
            // Verify user exists and ownership
            userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
            if (!post.getUserId().equals(userId)) {
                throw new UnauthorizedException("Not authorized to delete this post");
            }
            
            postRepository.delete(post);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Post deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting post: " + e.getMessage());
        }
    }

    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<?> getPostsByUserIdOrdered(@PathVariable String userId) {
        try {
            // Verify user exists
            userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                
            List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
