package com.alphaweb.instadrive.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

/**
 * Custom deserializer for Long values that handles "undefined" and other invalid values
 */
public class LongDeserializer extends JsonDeserializer<Long> {
    
    @Override
    public Long deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        
        // Handle null, empty string, or "undefined"
        if (value == null || value.isEmpty() || "undefined".equals(value) || "null".equals(value)) {
            return null;
        }
        
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            // Log the error
            System.err.println("Error parsing Long value: " + value);
            return null;
        }
    }
}
