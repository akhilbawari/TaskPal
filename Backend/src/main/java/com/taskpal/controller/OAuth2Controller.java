package com.taskpal.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taskpal.model.User;
import com.taskpal.repository.UserRepository;
import com.taskpal.service.GoogleCalendarService;
import com.taskpal.service.contextService;

@RestController
@RequestMapping("/oauth2")
public class OAuth2Controller {

	private final GoogleCalendarService googleCalendarService;
	private final UserRepository userRepository;
	private final contextService contextService;
	@Value("${app.email.verification.url}")
    private String verificationBaseUrl;

	public OAuth2Controller(GoogleCalendarService googleCalendarService, UserRepository userRepository,contextService contextService) {
		this.googleCalendarService = googleCalendarService;
		this.userRepository = userRepository;
		this.contextService=contextService;
	}

	@GetMapping("/google/authorize")
	public String authorizeGoogle() throws Exception {
		User currentUser = contextService.getCurrentUser();
		return googleCalendarService.authorize(currentUser);
	}

	@GetMapping("/google/callback")
	public String oauth2Callback(@RequestParam String code, @RequestParam String state) throws Exception {
		Long userId = Long.parseLong(state);
		googleCalendarService.storeCredentials(code, userId);
		String redirectHtml = "<html><head><script>window.location.replace('" + verificationBaseUrl
				+ "');</script></head><body></body></html>";

		return redirectHtml;
	}

}
