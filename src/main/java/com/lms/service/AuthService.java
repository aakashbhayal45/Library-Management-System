package com.lms.service;

import com.lms.entity.Admin;
import com.lms.exception.InvalidCredentialsException;
import com.lms.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    @Autowired
    private AdminRepository adminRepository;

    public Admin login(String username, String password) {

        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid username or password"));

        if (!admin.getPassword().equals(password)) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        return admin;
    }
}
