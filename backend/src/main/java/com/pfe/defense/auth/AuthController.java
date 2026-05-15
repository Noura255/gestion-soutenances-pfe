package com.pfe.defense.auth;

import com.pfe.defense.audit.AuditLogService;
import com.pfe.defense.security.JwtService;
import com.pfe.defense.user.User;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        User user = (User) authentication.getPrincipal();
        auditLogService.log("LOGIN", "AUTH", "Connexion réussie", user.getEmail());
        return new AuthResponse(jwtService.generateToken(user), "Bearer");
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal User user) {
        return MeResponse.from(user);
    }
}
