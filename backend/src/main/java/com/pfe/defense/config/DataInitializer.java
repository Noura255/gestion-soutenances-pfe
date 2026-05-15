package com.pfe.defense.config;

import com.pfe.defense.user.Role;
import com.pfe.defense.user.User;
import com.pfe.defense.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            createIfMissing(userRepository, passwordEncoder, "Admin", "System", "admin@sg.local", "Admin@123", Role.ADMIN, "Direction", "+212600000001");
            createIfMissing(userRepository, passwordEncoder, "Sara", "Etudiante", "student@sg.local", "Student@123", Role.STUDENT, "Informatique", "+212600000002");
            createIfMissing(userRepository, passwordEncoder, "Youssef", "Encadrant", "supervisor@sg.local", "Supervisor@123", Role.SUPERVISOR, "Informatique", "+212600000003");
            createIfMissing(userRepository, passwordEncoder, "Lina", "Jury", "jury@sg.local", "Jury@123", Role.JURY, "Informatique", "+212600000004");
            createIfMissing(userRepository, passwordEncoder, "Nadia", "Administration", "administration@sg.local", "Administration@123", Role.ADMINISTRATION, "Scolarité", "+212600000005");
        };
    }

    private void createIfMissing(UserRepository repository, PasswordEncoder encoder, String firstName, String lastName,
                                 String email, String password, Role role, String department, String phone) {
        if (repository.findByEmail(email).isPresent()) {
            return;
        }
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRole(role);
        user.setEnabled(true);
        user.setDepartment(department);
        user.setPhone(phone);
        repository.save(user);
    }
}
