package com.taskpal.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.taskpal.dto.TaskRequestDto;
import com.taskpal.dto.TaskResponseDto;
import com.taskpal.exception.BadRequestException;
import com.taskpal.model.Task;
import com.taskpal.model.User;
import com.taskpal.repository.TaskRepository;
import com.taskpal.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {

	private final TaskRepository taskRepository;
	private final contextService contextService;
	private final GoogleCalendarService googleCalendarService;

	private double calculatePriorityScore(int weight, LocalDate dueDate) {
		long daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(), dueDate);
		return weight / (daysUntilDue + 1.0); // +1 to avoid division by 0
	}

	@Transactional
	public TaskResponseDto addTask(TaskRequestDto dto) throws IOException, GeneralSecurityException {
		User user = contextService.getCurrentUser();

		if (user == null) {
			throw new BadRequestException("No User Found !");
		}

		Integer priority=taskRepository.findMaxPriorityScoreByUserId(user.getId());
		if (priority == null) {
		    priority = 0; // or any default value you prefer
		}
		Task task = new Task();
		task.setTitle(dto.getTitle());
		task.setDescription(dto.getDescription());
		task.setDueDate(dto.getDueDate());
		task.setWeight(dto.getWeight());
		task.setPriorityScore(++priority);
		task.setUser(user);

		if (dto.getParentTaskId() != null) {
			Task parentTask = taskRepository.findById(dto.getParentTaskId())
					.orElseThrow(() -> new EntityNotFoundException("Parent task not found"));
			task.setParentTask(parentTask);
		}
		if (user.isGoogle()) {
			String calendarEvent = googleCalendarService.createCalendarEvent(user, task);
			task.setGoogleEventId(calendarEvent);

		}

		return toResponse(taskRepository.save(task));
	}

	@Transactional
	public TaskResponseDto updateTask(Long taskId, TaskRequestDto dto) throws IOException, GeneralSecurityException {
		User user = contextService.getCurrentUser();

		if (user == null) {
			throw new BadRequestException("No User Found !");
		}
		
		Integer priority=taskRepository.findMaxPriorityScoreByUserId(user.getId());
		if (priority == null) {
		    priority = 1; // or any default value you prefer
		}

		Task task = taskRepository.findByIdAndUser(taskId, user)
				.orElseThrow(() -> new BadRequestException("Task not found"));

		task.setTitle(dto.getTitle());
		task.setDescription(dto.getDescription());
		task.setDueDate(dto.getDueDate());
		task.setWeight(dto.getWeight());
		if (user.isGoogle()) {
		   googleCalendarService.updateCalendarEvent(user, task);

		}
		return toResponse(taskRepository.save(task));
	}

	private TaskResponseDto toResponse(Task task) {
		TaskResponseDto dto = new TaskResponseDto();
		dto.setId(task.getId());
		dto.setTitle(task.getTitle());
		dto.setDescription(task.getDescription());
		dto.setDueDate(task.getDueDate());
		dto.setWeight(task.getWeight());
		dto.setCompleted(task.isCompleted());
		dto.setPriority(task.getPriorityScore());
		dto.setParentTaskId(task.getParentTask() != null ? task.getParentTask().getId() : null);
		dto.setSubtasks(task.getSubtasks().stream().map(this::toResponse).collect(Collectors.toList()));
		return dto;
	}
	
	@Transactional
	public List<TaskResponseDto> getTask() {
		
		User user = contextService.getCurrentUser();

		if (user == null) {
			throw new BadRequestException("No User Found !");
		}

		List<Task> task = taskRepository.findByUser( user);
		
		List<TaskResponseDto> list = task.stream().map(this::toResponse).toList();
		return list;
	}
	@Transactional
    public void deleteTask(Long taskId) throws IOException, GeneralSecurityException {
        User user = contextService.getCurrentUser();
        Task task = taskRepository.findByIdAndUser(taskId, user)
				.orElseThrow(() -> new BadRequestException("Task not found"));
        if (user.isGoogle()) {
			googleCalendarService.deleteCalendarEvent(user, task);

		}
        taskRepository.delete(task);
    }
	
	@Transactional
    public void updateTaskOrder(Long sourceId, Long destinationId) {
        User user = contextService.getCurrentUser();
        Task sourceTask = taskRepository.findByIdAndUser(sourceId, user)
				.orElseThrow(() -> new BadRequestException("Source Task not found"));
        int sourcePriorityScore=sourceTask.getPriorityScore();
        Task destinationTask = taskRepository.findByIdAndUser(destinationId, user)
				.orElseThrow(() -> new BadRequestException("Destination Task not found"));
        int destinationPriorityScore=destinationTask.getPriorityScore();

        // Implementation for reordering would depend on your frontend requirements
        sourceTask.setPriorityScore(destinationPriorityScore);
        destinationTask.setPriorityScore(sourcePriorityScore);
        taskRepository.save(sourceTask);
        taskRepository.save(destinationTask);
    }
	
	@Transactional
    public void markCompleteTask(Long taskId,boolean completed) {
        User user = contextService.getCurrentUser();
    	Task task = taskRepository.findByIdAndUser(taskId,user)
				.orElseThrow(() -> new BadRequestException("Task not found"));
    	task.setCompleted(completed);
    	updateSubtasksCompletion(task, completed);
        
        taskRepository.save(task);
    }
    
    private void updateSubtasksCompletion(Task parentTask, boolean completed) {
        if (parentTask.getSubtasks() != null && !parentTask.getSubtasks().isEmpty()) {
            for (Task subtask : parentTask.getSubtasks()) {
                subtask.setCompleted(completed);
                taskRepository.save(subtask);
                // Recursively update this subtask's subtasks
                updateSubtasksCompletion(subtask, completed);
            }
        }
    }
}
