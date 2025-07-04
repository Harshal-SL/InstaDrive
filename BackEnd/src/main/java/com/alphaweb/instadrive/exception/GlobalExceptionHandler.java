package com.alphaweb.instadrive.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the application
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle JSON parse errors
     *
     * @param ex The exception
     * @return Error response
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        Map<String, Object> errorResponse = new HashMap<>();
        
        // Extract the specific error message
        String errorMessage = ex.getMessage();
        String userFriendlyMessage = "Invalid request format. ";
        
        // Check for common errors
        if (errorMessage.contains("java.lang.Long")) {
            userFriendlyMessage += "Please provide valid numeric values for IDs.";
        } else if (errorMessage.contains("java.lang.Double") || errorMessage.contains("java.lang.Float")) {
            userFriendlyMessage += "Please provide valid numeric values for amounts.";
        } else {
            userFriendlyMessage += "Please check your input values.";
        }
        
        errorResponse.put("error", userFriendlyMessage);
        errorResponse.put("details", errorMessage);
        errorResponse.put("status", "BAD_REQUEST");
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
    
    /**
     * Handle general exceptions
     *
     * @param ex The exception
     * @return Error response
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        Map<String, Object> errorResponse = new HashMap<>();
        
        errorResponse.put("error", "An unexpected error occurred: " + ex.getMessage());
        errorResponse.put("status", "ERROR");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
