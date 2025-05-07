package com.taskpal.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

/**
 * A standardized API response format for all endpoints.
 * @param <T> The type of data being returned
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Standard response format for all API endpoints")
public class ApiResponse<T> {

    @Schema(description = "Indicates whether the request was successful", example = "true")
    private boolean success;

    @Schema(description = "Response message providing additional information", example = "Operation completed successfully")
    private String message;

    @Schema(description = "Response data payload")
    private T data;

    @Schema(description = "HTTP status code", example = "200")
    private HttpStatus status;

    @Schema(description = "Timestamp when the response was generated", example = "2023-05-20T15:30:45.123")
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Constructor for creating a response with success status and message.
     *
     * @param success whether the request was successful
     * @param message the response message
     */
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    /**
     * Constructor for creating a response with success status, message, and data.
     *
     * @param success whether the request was successful
     * @param message the response message
     * @param data the response data
     */
    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    /**
     * Creates a success response with a message.
     *
     * @param message the success message
     * @return the API response
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .status(HttpStatus.OK)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Creates a success response with data and a message.
     *
     * @param data the response data
     * @param message the success message
     * @return the API response
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .status(HttpStatus.OK)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Creates a bad request response with a message.
     *
     * @param message the error message
     * @return the API response
     */
    public static <T> ApiResponse<T> badRequest(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .status(HttpStatus.BAD_REQUEST)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Creates an error response with a message and status.
     *
     * @param message the error message
     * @param status the HTTP status
     * @return the API response
     */
    public static <T> ApiResponse<T> error(String message, HttpStatus status) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Creates a server error response with a message.
     *
     * @param message the error message
     * @return the API response
     */
    public static <T> ApiResponse<T> serverError(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
