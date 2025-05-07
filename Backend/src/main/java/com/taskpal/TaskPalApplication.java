package com.taskpal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;

/**
 * Main application class.
 * Enables async processing for email sending.
 */
@OpenAPIDefinition(
    info = @Info(
        title = "User Authentication API",
        version = "1.0",
        description = "API for user authentication and management",
        contact = @Contact(
            name = "Support Team",
            email = "support@example.com",
            url = "https://www.example.com"
        ),
        license = @License(
            name = "Apache 2.0",
            url = "https://www.apache.org/licenses/LICENSE-2.0"
        )
    ),
    servers = {
        @Server(
            url = "/",
            description = "Default Server URL"
        )
    }
)
@SpringBootApplication
@EnableAsync
public class TaskPalApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskPalApplication.class, args);
	}

}
