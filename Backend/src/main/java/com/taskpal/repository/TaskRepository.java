package com.taskpal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taskpal.model.Task;
import com.taskpal.model.User;

public interface TaskRepository extends JpaRepository<Task, Long> {

	Optional<Task> findByIdAndUserEmail(Long taskId, String userEmail);

	Optional<Task> findByIdAndUser(Long taskId, User user);
	
	List<Task> findByUser(User user);

	List<Task> findByParentTaskAndUser(Task parentTask, User user);
	
	@Query("SELECT MAX(t.priorityScore) FROM Task t WHERE t.user.id = :userId")
	Integer findMaxPriorityScoreByUserId(@Param("userId") Long userId);
	
	

}
