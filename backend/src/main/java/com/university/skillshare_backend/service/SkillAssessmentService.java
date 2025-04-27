package com.university.skillshare_backend.service;

import org.springframework.stereotype.Service;
import com.university.skillshare_backend.model.Quiz;
import com.university.skillshare_backend.model.SkillAssessment;
import com.university.skillshare_backend.repository.QuizRepository;
import com.university.skillshare_backend.repository.SkillAssessmentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillAssessmentService {
    private final QuizRepository quizRepository;
    private final SkillAssessmentRepository skillAssessmentRepository;

    public SkillAssessmentService(QuizRepository quizRepository, 
                                SkillAssessmentRepository skillAssessmentRepository) {
        this.quizRepository = quizRepository;
        this.skillAssessmentRepository = skillAssessmentRepository;
    }

    public List<Quiz> getQuizQuestions() {
        try {
            // Force reload questions every time
            loadDefaultQuestions();
            List<Quiz> allQuestions = quizRepository.findAll();
            Collections.shuffle(allQuestions);
            return allQuestions;
        } catch (Exception e) {
            throw new RuntimeException("Error fetching quiz questions: " + e.getMessage());
        }
    }

    private void loadDefaultQuestions() {
        try {
            // Clear existing questions first
            quizRepository.deleteAll();
            
            // Read questions from quiz_questions.json
            ObjectMapper mapper = new ObjectMapper();
            TypeReference<List<Quiz>> typeReference = new TypeReference<>() {};
            InputStream inputStream = TypeReference.class.getResourceAsStream("/quiz_questions.json");
            List<Quiz> questions = mapper.readValue(inputStream, typeReference);
            quizRepository.saveAll(questions);
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize quiz questions: " + e.getMessage());
        }
    }

    public SkillAssessment processAssessment(Map<String, Object> answers, String userId) {
        Map<String, Integer> categoryScores = new HashMap<>();
        int correctAnswers = 0;
        int wrongAnswers = 0;
        int totalPoints = 0;

        // Process each answer
        for (Map.Entry<String, Object> entry : answers.entrySet()) {
            String questionId = entry.getKey();
            String userAnswer = entry.getValue().toString();
            
            Quiz question = quizRepository.findById(questionId).orElse(null);
            
            if (question != null) {
                String category = question.getCategory();
                // Check if user's answer is in the array of correct answers
                boolean isCorrect = Arrays.asList(question.getCorrectAnswer()).contains(userAnswer);
                
                if (isCorrect) {
                    correctAnswers++;
                    totalPoints += question.getPoints();
                    categoryScores.merge(category, question.getPoints(), Integer::sum);
                } else {
                    wrongAnswers++;
                }
            }
        }

        // Get top 3 skills based on scores
        String[] topSkills = categoryScores.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(3)
                .map(Map.Entry::getKey)
                .toArray(String[]::new);

        SkillAssessment assessment = new SkillAssessment();
        assessment.setUserId(userId);
        assessment.setScores(categoryScores);
        assessment.setTopSkills(topSkills);
        assessment.setTotalScore(totalPoints);
        assessment.setCorrectAnswers(correctAnswers);
        assessment.setWrongAnswers(wrongAnswers);
        assessment.setCompletedAt(new Date());

        return skillAssessmentRepository.save(assessment);
    }
}
