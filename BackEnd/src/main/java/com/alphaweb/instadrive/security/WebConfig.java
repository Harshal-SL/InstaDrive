package com.alphaweb.instadrive.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Allow all endpoints
                        .allowedOriginPatterns("*") // Use allowedOriginPatterns instead of allowedOrigins
                        .allowedMethods("GET", "POST", "PUT", "DELETE") // HTTP methods allowed
                        .allowedHeaders("*") // All headers allowed
                        .exposedHeaders("Authorization") // Expose Authorization header
                        .allowCredentials(true); // Allow credentials
            }
        };
    }
}
