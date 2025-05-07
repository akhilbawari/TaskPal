package com.taskpal.controller;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taskpal.dto.ApiResponse;
import com.taskpal.dto.TaskRequestDto;
import com.taskpal.dto.TaskResponseDto;
import com.taskpal.service.TaskService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
	
    private final TaskService taskService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponseDto>> addTask(@RequestBody TaskRequestDto dto) throws IOException, GeneralSecurityException {
        TaskResponseDto createdTask = taskService.addTask(dto);
        return ResponseEntity.ok(ApiResponse.success(createdTask, "Created Task successfully"));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponseDto>> updateTask(@PathVariable Long id,
                                                      @RequestBody TaskRequestDto dto) throws IOException, GeneralSecurityException {
    	
        TaskResponseDto updatedTask = taskService.updateTask(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updatedTask, "Updated Task successfully"));
    }
    
    @GetMapping()
    public ResponseEntity<ApiResponse<List<TaskResponseDto>>> getTask() {
    	
       List<TaskResponseDto> task = taskService.getTask();
        return ResponseEntity.ok(ApiResponse.success(task, "Updated Task successfully"));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteTask(@PathVariable Long id) throws IOException, GeneralSecurityException {
        taskService.deleteTask(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Task Deleted SucessFully "));
    }

    @PatchMapping("/reorder")
    public ResponseEntity<ApiResponse> updateTaskOrder(
            @RequestParam Long sourceId,
            @RequestParam  Long destinationId) {
    	taskService.updateTaskOrder(sourceId, destinationId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Task Priority Updated SucessFully "));
    }
    
    @PatchMapping("/{id}/{completed}")
    public ResponseEntity<ApiResponse> markTaskCompleted(
            @PathVariable Long id,
            @PathVariable boolean completed) {
    	taskService.markCompleteTask(id, completed);
        return ResponseEntity.ok(new ApiResponse<>(true, "Task Priority Updated SucessFully "));
    }
}
