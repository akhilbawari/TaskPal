package com.taskpal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.taskpal.dto.ApiResponse;
import com.taskpal.dto.UserResponse;
import com.taskpal.service.UserService;

import java.util.List;

/**
 * Controller for user endpoints.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Get the current authenticated user.
     *
     * @return the response entity with user information
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        UserResponse userResponse = userService.getCurrentUser(email);
        return ResponseEntity.ok(ApiResponse.success(userResponse, "Current user retrieved successfully"));
    }

    /**
     * Get all users (admin only).
     *
     * @return the response entity with list of users
     */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "All users retrieved successfully"));
    }

    /**
     * Get a user by ID (admin only).
     *
     * @param id the user ID
     * @return the response entity with user information
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse userResponse = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(userResponse, "User retrieved successfully"));
    }
}
