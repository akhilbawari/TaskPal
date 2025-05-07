package com.taskpal.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class TaskRequestDto {

	private String title;
	private String description;
	private LocalDate dueDate;
	private int weight; // 1–5
	private int priority;
	private Long parentTaskId;
}
