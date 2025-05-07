package com.taskpal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for JWT authentication response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    
    private String token;
    private String type = "Bearer";
    private Long id;
    private String name;
    private String email;
    private String mobileNumber;
    private String role;
    
    /**
     * Constructor with token and user details.
     * 
     * @param token JWT token
     * @param id User ID
     * @param name User name
     * @param email User email
     * @param role User role
     */
    public JwtResponse(String token, Long id, String name, String email, String mobileNumber,String role) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.mobileNumber = mobileNumber;
        this.role = role;
    }
}