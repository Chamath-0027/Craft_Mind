package com.university.skillshare_backend.service;

import com.university.skillshare_backend.model.Session;
import com.university.skillshare_backend.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.UUID;
import java.util.Calendar;

@Service
public class SessionService {
    
    private final SessionRepository sessionRepository;
    
    @Autowired
    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }
    
    public Session createSession(String userId) {
        // Deactivate any existing active sessions
        sessionRepository.findByUserIdAndIsActiveTrue(userId)
            .forEach(session -> {
                session.setActive(false);
                sessionRepository.save(session);
            });
            
        // Create new session with 24 hour expiry
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.add(Calendar.HOUR, 24);
        
        Session session = new Session(
            userId,
            UUID.randomUUID().toString(),
            "web", // Default device info
            calendar.getTime()
        );
        
        return sessionRepository.save(session);
    }
    
    public Session createSession(String userId, String deviceInfo) {
        // Deactivate existing session for this device only
        sessionRepository.findByUserIdAndDeviceInfoAndIsActiveTrue(userId, deviceInfo)
            .ifPresent(session -> {
                session.setActive(false);
                sessionRepository.save(session);
            });
            
        // Create new session with 24 hour expiry
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.add(Calendar.HOUR, 24);
        
        Session session = new Session(
            userId,
            UUID.randomUUID().toString(),
            deviceInfo,
            calendar.getTime()
        );
        
        return sessionRepository.save(session);
    }

    public boolean validateSession(String token) {
        return sessionRepository.findByTokenAndIsActiveTrue(token)
            .map(session -> {
                Date now = new Date();
                if (now.after(session.getExpiresAt())) {
                    session.setActive(false);
                    sessionRepository.save(session);
                    return false;
                }
                return true;
            })
            .orElse(false);
    }
    
    public void invalidateSession(String token) {
        sessionRepository.findByToken(token)
            .ifPresent(session -> {
                session.setActive(false);
                sessionRepository.save(session);
            });
    }
}
