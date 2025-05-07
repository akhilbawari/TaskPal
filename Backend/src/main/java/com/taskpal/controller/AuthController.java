package com.taskpal.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.taskpal.dto.ApiResponse;
import com.taskpal.dto.JwtResponse;
import com.taskpal.dto.SigninRequest;
import com.taskpal.dto.SignupRequest;
import com.taskpal.service.AuthService;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for authentication endpoints.
 */
@Tag(name = "Authentication", description = "Authentication API")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Register a new user.
     *
     * @param signupRequest the signup request
     * @return the response entity
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        boolean success = authService.registerUser(signupRequest);

        if (success) {
            return ResponseEntity.ok(
                ApiResponse.success("User registered successfully! Please check your email to verify your account.")
            );
        } else {
            return ResponseEntity.badRequest().body(
                ApiResponse.badRequest("Error: Email is already in use!")
            );
        }
    }

    /**
     * Authenticate a user.
     *
     * @param signinRequest the signin request
     * @return the response entity with JWT token
     */
    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody SigninRequest signinRequest) {
        try {
            JwtResponse jwtResponse = authService.authenticateUser(signinRequest);
            return ResponseEntity.ok(ApiResponse.success(jwtResponse, "Authentication successful"));
        } catch (Exception e) {
            // Let the global exception handler handle this
            throw e;
        }
    }

    /**
     * Verify a user's email.
     *
     * @param token the verification token
     * @return the response entity
     */
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<?>> verifyEmail(@RequestParam String token) {
        JwtResponse jwtResponse = authService.verifyEmail(token);

        if (jwtResponse != null) {
            return ResponseEntity.ok(
                ApiResponse.success(jwtResponse, "Email verified successfully! You are now signed in.")
            );
        } else {
            return ResponseEntity.badRequest().body(
                ApiResponse.badRequest("Invalid or expired verification token.")
            );
        }
    }

    /**
     * Resend verification email.
     *
     * @param email the user's email
     * @return the response entity
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerificationEmail(@RequestParam String email) {
        boolean success = authService.resendVerificationEmail(email);

        if (success) {
            return ResponseEntity.ok(
                ApiResponse.success("Verification email resent successfully! Please check your email.")
            );
        } else {
            return ResponseEntity.badRequest().body(
                ApiResponse.badRequest("Error: User not found or email already verified.")
            );
        }
    }
}
