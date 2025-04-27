package com.university.skillshare_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.university.skillshare_backend.service.SkillAssessmentService;
import com.university.skillshare_backend.repository.SkillAssessmentRepository;
import com.university.skillshare_backend.model.Quiz;
import com.university.skillshare_backend.model.SkillAssessment;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = "*")
public class SkillAssessmentController {
    private final SkillAssessmentService skillAssessmentService;
    private final SkillAssessmentRepository skillAssessmentRepository;

    public SkillAssessmentController(
            SkillAssessmentService skillAssessmentService,
            SkillAssessmentRepository skillAssessmentRepository) {
        this.skillAssessmentService = skillAssessmentService;
        this.skillAssessmentRepository = skillAssessmentRepository;
    }

    @GetMapping("/quiz")
    public ResponseEntity<List<Quiz>> getQuizQuestions() {
        List<Quiz> questions = skillAssessmentService.getQuizQuestions();
        if (questions.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/assess")
    public SkillAssessment submitAssessment(@RequestBody Map<String, Object> answers,
                                          @RequestParam String userId) {
        return skillAssessmentService.processAssessment(answers, userId);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<SkillAssessment>> getUserAssessmentHistory(@PathVariable String userId) {
        List<SkillAssessment> history = skillAssessmentRepository.findByUserIdOrderByCompletedAtDesc(userId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/latest/{userId}")
    public ResponseEntity<SkillAssessment> getLatestAssessment(@PathVariable String userId) {
        Optional<SkillAssessment> assessment = skillAssessmentRepository.findFirstByUserIdOrderByCompletedAtDesc(userId);
        return assessment.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/select-favorite")
    public ResponseEntity<Map<String, Object>> selectFavoriteSkill(
            @RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String skill = request.get("skill");
        
        // Here you would typically update the user's profile with the selected skill
        // For now, we'll just return a success response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Favorite skill selected: " + skill);
        response.put("userId", userId);
        response.put("skill", skill);
        
        return ResponseEntity.ok(response);
    }
}
