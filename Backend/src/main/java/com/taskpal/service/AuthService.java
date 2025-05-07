package com.taskpal.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskpal.dto.JwtResponse;
import com.taskpal.dto.SigninRequest;
import com.taskpal.dto.SignupRequest;
import com.taskpal.model.Role;
import com.taskpal.model.User;
import com.taskpal.repository.UserRepository;
import com.taskpal.security.JwtUtils;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for user authentication and registration.
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    /**
     * Register a new user.
     *
     * @param signupRequest the signup request
     * @return true if registration is successful, false otherwise
     */
    @Transactional
    public boolean registerUser(SignupRequest signupRequest) {
        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            logger.info("Email {} is already in use", signupRequest.getEmail());
            return false;
        }

        // Create new user
        User user = User.builder()
                .name(signupRequest.getName())
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .role(Role.ROLE_USER)
                .emailVerified(false)
                .mobileNumber(signupRequest.getMobileNumber())
                .build();

        // Generate verification token
        String verificationToken = user.generateVerificationToken();

        // Save user
        userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(
                user.getEmail(),
                user.getName(),
                verificationToken
        );

        logger.info("User registered successfully: {}", user.getEmail());
        return true;
    }

    /**
     * Authenticate a user and generate a JWT token.
     *
     * @param signinRequest the signin request
     * @return the JWT response
     */
    public JwtResponse authenticateUser(SigninRequest signinRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        signinRequest.getEmail(),
                        signinRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found with email: " + userDetails.getUsername()));

        return new JwtResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getMobileNumber(),
                user.getRole().name()
        );
    }

    /**
     * Verify a user's email using the verification token.
     *
     * @param token the verification token
     * @return JwtResponse if verification is successful, null otherwise
     */
    @Transactional
    public JwtResponse verifyEmail(String token) {
        Optional<User> userOpt = userRepository.findByVerificationToken(token);

        if (userOpt.isEmpty()) {
            logger.info("Verification failed: Token not found");
            return null;
        }

        User user = userOpt.get();

        if (!user.isVerificationTokenValid()) {
            logger.info("Verification failed: Token expired for user {}", user.getEmail());
            return null;
        }

        user.markEmailAsVerified();
        userRepository.save(user);

        // Generate JWT token for the verified user
        String jwt = jwtUtils.generateJwtTokenWithUser(user);

        logger.info("Email verified successfully for user: {}", user.getEmail());
        return new JwtResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getMobileNumber(),
                user.getRole().name()
        );
    }

    /**
     * Resend verification email to a user.
     *
     * @param email the user's email
     * @return true if email is sent successfully, false otherwise
     */
    @Transactional
    public boolean resendVerificationEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            logger.info("Resend verification failed: User not found with email {}", email);
            return false;
        }

        User user = userOpt.get();

        if (user.isEmailVerified()) {
            logger.info("Resend verification failed: Email already verified for user {}", email);
            return false;
        }

        String verificationToken = user.generateVerificationToken();
        userRepository.save(user);

        emailService.sendVerificationEmail(
                user.getEmail(),
                user.getName(),
                verificationToken
        );

        logger.info("Verification email resent to: {}", user.getEmail());
        return true;
    }
}
