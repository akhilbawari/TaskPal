package com.taskpal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a user in the system.
 * Contains user authentication details and profile information.
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String mobileNumber;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean emailVerified;
    
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean google;

    @Column(unique = true)
    private String verificationToken;

    @Column
    private LocalDateTime verificationTokenExpiry;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column
    private String googleCalendarAccessToken;
    
    @Column
    private String googleCalendarRefreshToken;

    /**
     * Generates a new verification token for email verification.
     * @return The generated verification token
     */
    public String generateVerificationToken() {
        this.verificationToken = UUID.randomUUID().toString();
        this.verificationTokenExpiry = LocalDateTime.now().plusHours(24); // Token valid for 24 hours
        return this.verificationToken;
    }

    /**
     * Checks if the verification token is valid (not expired).
     * @return true if the token is valid, false otherwise
     */
    public boolean isVerificationTokenValid() {
        return verificationTokenExpiry != null && LocalDateTime.now().isBefore(verificationTokenExpiry);
    }

    /**
     * Marks the user's email as verified and clears the verification token.
     */
    public void markEmailAsVerified() {
        this.emailVerified = true;
        this.verificationToken = null;
        this.verificationTokenExpiry = null;
    }
}