package com.university.skillshare_backend.repository;

import com.university.skillshare_backend.model.Session;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends MongoRepository<Session, String> {
    Optional<Session> findByToken(String token);
    List<Session> findByUserIdAndIsActiveTrue(String userId);
    Optional<Session> findByTokenAndIsActiveTrue(String token);
    Optional<Session> findByUserIdAndDeviceInfoAndIsActiveTrue(String userId, String deviceInfo);
    List<Session> findByUserIdAndDeviceInfo(String userId, String deviceInfo);
}
