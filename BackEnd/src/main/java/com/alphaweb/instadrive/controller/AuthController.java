package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.dto.AuthResponse;
import com.alphaweb.instadrive.dto.LoginRequest;
import com.alphaweb.instadrive.dto.RegisterRequest;
import com.alphaweb.instadrive.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Auth controller is working!");
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        System.out.println("Register request received: " + request.getEmail());
        try {
            AuthResponse response = authService.register(request);
            System.out.println("Registration successful for: " + request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Registration failed: " + e.getMessage());
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        System.out.println("Login request received: " + request.getEmail());
        try {
            AuthResponse response = authService.login(request);
            System.out.println("Login successful for: " + request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Login failed: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Admin login endpoint
     * This endpoint is specifically for admin users
     *
     * @param request The login request containing email and password
     * @return Authentication response with JWT token
     */
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginRequest request) {
        System.out.println("Admin login request received: " + request.getEmail());
        try {
            // Attempt to login
            AuthResponse response = authService.login(request);

            // Check if the user has admin role
            if (response.getRole() == null || !response.getRole().equals("ADMIN")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. User is not an admin.");
                errorResponse.put("status", "error");
                return ResponseEntity.status(403).body(errorResponse);
            }

            System.out.println("Admin login successful for: " + request.getEmail());

            // Add additional information to the response
            Map<String, Object> adminResponse = new HashMap<>();
            adminResponse.put("token", response.getToken());
            adminResponse.put("userId", response.getUserId());
            adminResponse.put("email", response.getEmail());
            adminResponse.put("name", response.getName());
            adminResponse.put("role", response.getRole());
            adminResponse.put("message", "Admin login successful");

            return ResponseEntity.ok(adminResponse);
        } catch (Exception e) {
            System.out.println("Admin login failed: " + e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("status", "error");

            return ResponseEntity.status(401).body(errorResponse);
        }
    }
}
