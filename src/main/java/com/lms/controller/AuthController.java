package com.lms.controller;

import com.lms.entity.Admin;
import com.lms.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Admin login(@RequestBody Admin loginRequest) {
        return authService.login(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );
    }
}