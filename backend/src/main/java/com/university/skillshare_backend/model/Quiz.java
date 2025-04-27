package com.university.skillshare_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "quizzes")
public class Quiz {
    @Id
    private String id;
    private String question;
    private String[] options;
    private String[] correctAnswer;  // Changed to array
    private String category;
    private int points;

    public Quiz() {
    }

    public Quiz(String id, String question, String[] options, String[] correctAnswer, String category, int points) {
        this.id = id;
        this.question = question;
        this.options = options;
        this.correctAnswer = correctAnswer;
        this.category = category;
        this.points = points;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String[] getOptions() {
        return options;
    }

    public void setOptions(String[] options) {
        this.options = options;
    }

    public String[] getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String[] correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }
}
