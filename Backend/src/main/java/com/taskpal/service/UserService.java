package com.taskpal.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.taskpal.dto.UserResponse;
import com.taskpal.model.User;
import com.taskpal.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for user-related operations.
 */
@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    /**
     * Get the current user by email.
     *
     * @param email the user's email
     * @return the user response
     * @throws UsernameNotFoundException if the user is not found
     */
    public UserResponse getCurrentUser(String email) {
        logger.info("Fetching user with email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        return UserResponse.fromUser(user);
    }

    /**
     * Get all users.
     *
     * @return the list of user responses
     */
    public List<UserResponse> getAllUsers() {
        logger.info("Fetching all users");
        return userRepository.findAll().stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    /**
     * Get a user by ID.
     *
     * @param id the user ID
     * @return the user response
     * @throws UsernameNotFoundException if the user is not found
     */
    public UserResponse getUserById(Long id) {
        logger.info("Fetching user with ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + id));
        
        return UserResponse.fromUser(user);
    }
}