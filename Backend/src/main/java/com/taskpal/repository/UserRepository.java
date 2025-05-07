package com.taskpal.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taskpal.model.User;

import java.util.Optional;

/**
 * Repository interface for User entity.
 * Provides methods to interact with the users table in the database.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find a user by email.
     * @param email the email to search for
     * @return an Optional containing the user if found, empty otherwise
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if a user exists with the given email.
     * @param email the email to check
     * @return true if a user exists with the email, false otherwise
     */
    boolean existsByEmail(String email);
    
    /**
     * Find a user by verification token.
     * @param token the verification token to search for
     * @return an Optional containing the user if found, empty otherwise
     */
    Optional<User> findByVerificationToken(String token);
}