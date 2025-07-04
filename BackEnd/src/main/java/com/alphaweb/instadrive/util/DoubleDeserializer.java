package com.alphaweb.instadrive.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

/**
 * Custom deserializer for Double values that handles "undefined" and other invalid values
 */
public class DoubleDeserializer extends JsonDeserializer<Double> {
    
    @Override
    public Double deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        
        // Handle null, empty string, or "undefined"
        if (value == null || value.isEmpty() || "undefined".equals(value) || "null".equals(value)) {
            return 0.0; // Default to 0 for amount
        }
        
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            // Log the error
            System.err.println("Error parsing Double value: " + value);
            return 0.0; // Default to 0
        }
    }
}
