package com.lms.service;

import com.lms.entity.User;
import com.lms.exception.DuplicateResourceException;
import com.lms.exception.UserNotFoundException;
import com.lms.repository.IssueRecordRepository;
import com.lms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IssueRecordRepository issueRecordRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> searchUsers(String keyword) {

        String kw = keyword.toLowerCase();

        return userRepository.findAll().stream()
                .filter(u ->
                        (u.getName() != null && u.getName().toLowerCase().contains(kw)) ||
                                (u.getEmail() != null && u.getEmail().toLowerCase().contains(kw)) ||
                                (u.getContact() != null && u.getContact().toLowerCase().contains(kw)) ||
                                String.valueOf(u.getId()).contains(kw)
                )
                .collect(Collectors.toList());
    }

    public User addUser(User user) {

        if (user.getId() == null) {
            if (userRepository.existsByEmail(user.getEmail()) ||
                    userRepository.existsByContact(user.getContact())) {

                throw new DuplicateResourceException("User already exists");
            }
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + id));

        issueRecordRepository.deleteByUserId(id);
        userRepository.delete(user);
    }

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + id));
    }
}