package com.alphaweb.instadrive;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InstaDriveApplication {

    public static void main(String[] args) {
        SpringApplication.run(InstaDriveApplication.class, args);
    }

}
