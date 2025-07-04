package com.alphaweb.instadrive.controller;

import com.alphaweb.instadrive.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users/check")
@RequiredArgsConstructor
public class UserCheckController {

    private final UserService userService;

    @GetMapping("/{email}")
    public ResponseEntity<Map<String, Object>> checkEmail(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();
        boolean exists = userService.existsByEmail(email);
        response.put("email", email);
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }
}
