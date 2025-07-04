package com.alphaweb.instadrive.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating car image URL
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarImageRequest {
    private String imageUrl;
}
