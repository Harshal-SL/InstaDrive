package com.alphaweb.instadrive.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserIdGeneratorTest {

    @Test
    void testGenerateUserId() {
        // Generate a user ID
        String userId = UserIdGenerator.generateUserId();
        
        // Check that it's not null or empty
        assertNotNull(userId);
        assertFalse(userId.isEmpty());
        
        // Check that it follows the expected format: USER-YYMMDD-XXXX
        assertTrue(userId.startsWith("USER-"));
        
        // Check that it has the correct number of parts
        String[] parts = userId.split("-");
        assertEquals(3, parts.length);
        
        // Check that the middle part is a date (6 digits)
        assertEquals(6, parts[1].length());
        assertTrue(parts[1].matches("\\d{6}"));
        
        // Check that the last part is 4 characters
        assertEquals(4, parts[2].length());
        
        // Generate another ID and make sure it's different
        String userId2 = UserIdGenerator.generateUserId();
        assertNotEquals(userId, userId2);
    }
}
