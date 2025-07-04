package com.alphaweb.instadrive.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * Utility class for generating unique user IDs
 */
public class UserIdGenerator {

    /**
     * Generate a unique user ID
     * Format: USER-YYMMDD-XXXX (where XXXX is a random alphanumeric string)
     *
     * @return A unique user ID
     */
    public static String generateUserId() {
        // Get current date in YYMMDD format
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));

        // Generate a random 4-character alphanumeric string
        String randomPart = generateRandomAlphanumeric(4);

        // Combine parts to create the user ID
        return "USER-" + datePart + "-" + randomPart;
    }

    /**
     * Generate a random alphanumeric string of the specified length
     *
     * @param length The length of the string to generate
     * @return A random alphanumeric string
     */
    private static String generateRandomAlphanumeric(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(chars.length());
            sb.append(chars.charAt(index));
        }

        return sb.toString();
    }
}
