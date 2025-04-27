package com.university.skillshare_backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.university.skillshare_backend.model.Quiz;

public interface QuizRepository extends MongoRepository<Quiz, String> {
}
