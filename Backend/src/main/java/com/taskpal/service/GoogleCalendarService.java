package com.taskpal.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.client.auth.oauth2.BearerToken;
import com.google.api.client.auth.oauth2.ClientParametersAuthentication;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.taskpal.model.Task;
import com.taskpal.model.User;
import com.taskpal.repository.TaskRepository;
import com.taskpal.repository.UserRepository;

@Service
public class GoogleCalendarService {

	private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
	private static final List<String> SCOPES = Collections.singletonList(CalendarScopes.CALENDAR);

	@Value("${google.client.id}")
	private String clientId;

	@Value("${google.client.secret}")
	private String clientSecret;

	@Value("${google.redirect.uri}")
	private String redirectUri;

	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private TaskRepository taskRepository;

	public String authorize(User user) throws IOException, GeneralSecurityException {
		GoogleAuthorizationCodeFlow flow = getFlow();
		return flow.newAuthorizationUrl().setRedirectUri(redirectUri).setState(user.getId().toString()).build();
	}

	public void storeCredentials(String code, Long userId) throws IOException, GeneralSecurityException {
		GoogleAuthorizationCodeFlow flow = getFlow();
		GoogleTokenResponse response = flow.newTokenRequest(code).setRedirectUri(redirectUri).execute();

		// Store the access token and refresh token in the user's account
		User user = userRepository.findById(userId).orElseThrow();
		user.setGoogleCalendarAccessToken(response.getAccessToken());
		user.setGoogleCalendarRefreshToken(response.getRefreshToken());
		user.setGoogle(true);
		userRepository.save(user);
		
		List<Task> tasks = taskRepository.findByUser(user);
		
		for (Task task : tasks) {
            try {
                if (task.getGoogleEventId() == null) { // Only sync if not already synced
                    String eventId = this.createCalendarEvent(user, task);
                    task.setGoogleEventId(eventId);
                    taskRepository.save(task); // Update task with event ID
                }
            } catch (Exception e) {
                System.err.println("Failed to sync task " + task.getId() + ": " + e.getMessage());
            }
        }

	}

	public String createCalendarEvent(User user, Task task) throws IOException, GeneralSecurityException {
		if (user.getGoogleCalendarAccessToken() == null) {
			return null;
		}

		// Initialize transport
		final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();

		// Create credential
		Credential credential = new Credential.Builder(BearerToken.authorizationHeaderAccessMethod())
				.setTransport(HTTP_TRANSPORT).setJsonFactory(JSON_FACTORY)
				.setTokenServerUrl(new GenericUrl("https://oauth2.googleapis.com/token"))
				.setClientAuthentication(new ClientParametersAuthentication(clientId, clientSecret)).build()
				.setAccessToken(user.getGoogleCalendarAccessToken())
				.setRefreshToken(user.getGoogleCalendarRefreshToken());

		// Build Calendar service
		Calendar service = new Calendar.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential).setApplicationName("TaskPal")
				.build();

		// Handle LocalDate conversion
		LocalDate dueDate = task.getDueDate();
		if (dueDate == null) {
			throw new IllegalArgumentException("Task due date cannot be null");
		}

		// Convert LocalDate to DateTime (whole day event)
		DateTime startDateTime = new DateTime(dueDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli());
		DateTime endDateTime = new DateTime(
				dueDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli());

		// Create event
		Event event = new Event().setSummary(task.getTitle()).setDescription(task.getDescription());

		// Set as all-day event
		event.setStart(
				new EventDateTime().setDate(new com.google.api.client.util.DateTime(true, startDateTime.getValue(),
						startDateTime.getTimeZoneShift())).setTimeZone(ZoneId.systemDefault().getId()));

		event.setEnd(new EventDateTime().setDate(
				new com.google.api.client.util.DateTime(true, endDateTime.getValue(), endDateTime.getTimeZoneShift()))
				.setTimeZone(ZoneId.systemDefault().getId()));

		// Insert event
		return service.events().insert("primary", event).execute().getId();
	}

	private GoogleAuthorizationCodeFlow getFlow() throws IOException, GeneralSecurityException {
		// Create client secrets object directly
		GoogleClientSecrets.Details details = new GoogleClientSecrets.Details().setClientId(clientId)
				.setClientSecret(clientSecret);

		GoogleClientSecrets clientSecrets = new GoogleClientSecrets().setWeb(details);

		return new GoogleAuthorizationCodeFlow.Builder(GoogleNetHttpTransport.newTrustedTransport(), JSON_FACTORY,
				clientSecrets, SCOPES).setAccessType("offline").build();
	}
	
	public void updateCalendarEvent(User user, Task task) throws IOException, GeneralSecurityException {
        if (user.getGoogleCalendarAccessToken() == null || task.getGoogleEventId() == null) {
            return;
        }

        Calendar service = getCalendarService(user);
        Event existingEvent = service.events().get("primary", task.getGoogleEventId()).execute();
        
        // Update event details
        Event updatedEvent = updateEventFromTask(existingEvent, task);
        
        // Update the event
        service.events().update("primary", task.getGoogleEventId(), updatedEvent).execute();
    }
	
	public void deleteCalendarEvent(User user, Task task) throws IOException, GeneralSecurityException {
        if (user.getGoogleCalendarAccessToken() == null || task.getGoogleEventId() == null) {
            return;
        }

        Calendar service = getCalendarService(user);
        service.events().delete("primary", task.getGoogleEventId()).execute();
        
        // Clear the Google Event ID from the task
        task.setGoogleEventId(null);
        taskRepository.save(task);
    }
	
	private Calendar getCalendarService(User user) throws GeneralSecurityException, IOException {
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        
        Credential credential = new Credential.Builder(BearerToken.authorizationHeaderAccessMethod())
                .setTransport(HTTP_TRANSPORT)
                .setJsonFactory(JSON_FACTORY)
                .setTokenServerUrl(new GenericUrl("https://oauth2.googleapis.com/token"))
                .setClientAuthentication(new ClientParametersAuthentication(clientId, clientSecret))
                .build()
                .setAccessToken(user.getGoogleCalendarAccessToken())
                .setRefreshToken(user.getGoogleCalendarRefreshToken());

        return new Calendar.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential)
                .setApplicationName("TaskPal")
                .build();
    }
	private Event updateEventFromTask(Event existingEvent, Task task) {
        validateTaskDueDate(task);

        DateTime startDateTime = getStartDateTime(task);
        DateTime endDateTime = getEndDateTime(task);

        return existingEvent
                .setSummary(task.getTitle())
                .setDescription(task.getDescription())
                .setStart(createEventDateTime(startDateTime))
                .setEnd(createEventDateTime(endDateTime));
    }

	private void validateTaskDueDate(Task task) {
        if (task.getDueDate() == null) {
            throw new IllegalArgumentException("Task due date cannot be null");
        }
    }

    private DateTime getStartDateTime(Task task) {
        return new DateTime(task.getDueDate().atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli());
    }

    private DateTime getEndDateTime(Task task) {
        return new DateTime(task.getDueDate().plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli());
    }

    private EventDateTime createEventDateTime(DateTime dateTime) {
        return new EventDateTime()
                .setDate(new com.google.api.client.util.DateTime(
                        true, 
                        dateTime.getValue(), 
                        dateTime.getTimeZoneShift()))
                .setTimeZone(ZoneId.systemDefault().getId());
    }
}