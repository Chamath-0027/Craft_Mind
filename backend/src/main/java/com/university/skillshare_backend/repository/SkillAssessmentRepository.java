package com.university.skillshare_backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.university.skillshare_backend.model.SkillAssessment;
import java.util.List;
import java.util.Optional;

public interface SkillAssessmentRepository extends MongoRepository<SkillAssessment, String> {
    List<SkillAssessment> findByUserId(String userId);
    List<SkillAssessment> findByUserIdOrderByCompletedAtDesc(String userId);
    Optional<SkillAssessment> findFirstByUserIdOrderByCompletedAtDesc(String userId);
}
