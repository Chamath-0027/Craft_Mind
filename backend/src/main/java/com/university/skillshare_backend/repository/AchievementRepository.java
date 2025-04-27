package com.university.skillshare_backend.repository;

import com.university.skillshare_backend.model.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.util.Set;

public interface AchievementRepository extends MongoRepository<Achievement, String> {
    List<Achievement> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Achievement> findAllByOrderByCreatedAtDesc();
    List<Achievement> findByUserIdAndCategoryOrderByCreatedAtDesc(String userId, String category);
    
    @Query(value = "{'userId': ?0}", fields = "{'category': 1, '_id': 0}")
    Set<String> findDistinctCategoriesByUserId(String userId); // Changed return type to Set<String>
}
