package com.taskpal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.taskpal.model.User;

/**
 * DTO for user information response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    
    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean emailVerified;
    private boolean google;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * Static factory method to create UserResponse from User entity.
     * 
     * @param user User entity
     * @return UserResponse DTO
     */
    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .google(user.isGoogle())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}