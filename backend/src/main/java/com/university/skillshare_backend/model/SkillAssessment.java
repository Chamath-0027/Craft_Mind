package com.university.skillshare_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Map;
import java.util.Date;

@Document(collection = "skill_assessments")
public class SkillAssessment {
    @Id
    private String id;
    private String userId;
    private Map<String, Integer> scores;
    private Map<String, Integer> categoryStats;
    private String[] topSkills;
    private int totalScore;
    private int correctAnswers;
    private int wrongAnswers;
    private Date completedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Map<String, Integer> getScores() {
        return scores;
    }

    public void setScores(Map<String, Integer> scores) {
        this.scores = scores;
    }

    public Map<String, Integer> getCategoryStats() {
        return categoryStats;
    }

    public void setCategoryStats(Map<String, Integer> categoryStats) {
        this.categoryStats = categoryStats;
    }

    public String[] getTopSkills() {
        return topSkills;
    }

    public void setTopSkills(String[] topSkills) {
        this.topSkills = topSkills;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(int correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public int getWrongAnswers() {
        return wrongAnswers;
    }

    public void setWrongAnswers(int wrongAnswers) {
        this.wrongAnswers = wrongAnswers;
    }

    public Date getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Date completedAt) {
        this.completedAt = completedAt;
    }
}
