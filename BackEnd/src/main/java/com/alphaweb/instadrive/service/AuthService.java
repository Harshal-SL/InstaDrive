package com.alphaweb.instadrive.service;

import com.alphaweb.instadrive.dto.AuthResponse;
import com.alphaweb.instadrive.dto.LoginRequest;
import com.alphaweb.instadrive.dto.RegisterRequest;
import com.alphaweb.instadrive.model.User;
import com.alphaweb.instadrive.security.JwtUtil;
import com.alphaweb.instadrive.util.UserIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        User user;

        // Check if user already exists
        if (userService.existsByEmail(request.getEmail())) {
            // Get existing user and update fields
            user = userService.getUserByEmail(request.getEmail()).orElseThrow();
            user.setName(request.getName());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());
            // Don't change role for existing users
        } else {
            // Create new user
            user = new User();
            user.setName(request.getName());
            user.setUsername(request.getEmail()); // Set username to email
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());
            user.setRole(User.Role.USER);

            // Generate and set unique user ID
            user.setUserId(UserIdGenerator.generateUserId());
        }

        userService.saveUser(user);

        // Generate JWT token
        UserDetails userDetails = userService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Get user details
        User user = userService.getUserByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate JWT token
        UserDetails userDetails = userService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }
}
