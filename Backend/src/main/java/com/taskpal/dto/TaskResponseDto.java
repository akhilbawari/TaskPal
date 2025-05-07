package com.taskpal.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class TaskResponseDto {
	private Long id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private int weight;
    private int priority;
    private boolean completed;
    private Long parentTaskId;
    private List<TaskResponseDto> subtasks;
}
