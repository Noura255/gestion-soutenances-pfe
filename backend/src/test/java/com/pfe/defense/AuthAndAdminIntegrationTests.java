package com.pfe.defense;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.defense.audit.AuditLogRepository;
import com.pfe.defense.config.DataSeeder;
import com.pfe.defense.project.ProjectRepository;
import com.pfe.defense.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthAndAdminIntegrationTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DataSeeder dataSeeder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    void adminCanLoginReadProfileAndOpenDashboard() throws Exception {
        String loginResponse = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"admin@sgsoutenance.com","password":"admin123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode body = objectMapper.readTree(loginResponse);
        String token = body.get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@sgsoutenance.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"));

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").isNumber())
                .andExpect(jsonPath("$.activeUsers").isNumber());
    }

    @Test
    void studentCannotOpenAdminRoutes() throws Exception {
        String loginResponse = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"student1@sgsoutenance.com","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String token = objectMapper.readTree(loginResponse).get("token").asText();

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanImportUsersAndDownloadExports() throws Exception {
        String token = loginAs("admin@sgsoutenance.com", "admin123");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "users.csv",
                "text/csv",
                """
                        firstName,lastName,email,role,department,phone
                        Noor,Alpha,noor.alpha@sg.local,STUDENT,Info,0600000000
                        Duplicate,Alpha,noor.alpha@sg.local,STUDENT,Info,0600000001
                        """.getBytes()
        );

        mockMvc.perform(multipart("/api/admin/users/import")
                        .file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.importedCount").value(1))
                .andExpect(jsonPath("$.ignoredRows[0].reason").value("Email dupliqué dans le fichier."));

        mockMvc.perform(get("/api/admin/users/export/csv")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/csv"));
    }

    @Test
    void failedLoginsCreateHistoryAndSecurityAlerts() throws Exception {
        String token = loginAs("admin@sgsoutenance.com", "admin123");
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"student1@sgsoutenance.com","password":"bad-password"}
                                    """))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(get("/api/admin/login-history")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("FAILED"));

        mockMvc.perform(get("/api/admin/security-alerts")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email == 'student1@sgsoutenance.com')]").exists());

        mockMvc.perform(post("/api/admin/chatbot/ask")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"question":"Y a-t-il des connexions échouées ?"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value(org.hamcrest.Matchers.containsString("tentative(s) de connexion échouée(s)")));
    }

    @Test
    void adminCanReadAndUpdateSystemSettings() throws Exception {
        String token = loginAs("admin@sgsoutenance.com", "admin123");

        mockMvc.perform(get("/api/admin/settings")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeAcademicYear").value("2025-2026"));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/admin/settings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "activeAcademicYear":"2026-2027",
                                  "maxReportPdfSizeMb":30,
                                  "registrationsEnabled":false,
                                  "supportEmail":"help@sg.local"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeAcademicYear").value("2026-2027"))
                .andExpect(jsonPath("$.registrationsEnabled").value(false));
    }

    @Test
    void seededFailedLoginsExposeStudent5SecurityAlert() throws Exception {
        String token = loginAs("admin@sgsoutenance.com", "admin123");

        mockMvc.perform(get("/api/admin/security-alerts")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email == 'student5@sgsoutenance.com')]").exists());
    }

    @Test
    void seederIsIdempotentWhenExecutedAgain() throws Exception {
        int seedUsersBefore = userRepository.findAllBySeedDataTrue().size();
        int seedProjectsBefore = projectRepository.findAllBySeedDataTrue().size();
        int seedLogsBefore = auditLogRepository.findAllBySeedDataTrue().size();

        dataSeeder.run(new DefaultApplicationArguments(new String[0]));

        org.assertj.core.api.Assertions.assertThat(userRepository.findAllBySeedDataTrue()).hasSize(seedUsersBefore);
        org.assertj.core.api.Assertions.assertThat(projectRepository.findAllBySeedDataTrue()).hasSize(seedProjectsBefore);
        org.assertj.core.api.Assertions.assertThat(auditLogRepository.findAllBySeedDataTrue()).hasSize(seedLogsBefore);
    }

    private String loginAs(String email, String password) throws Exception {
        String loginResponse = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(loginResponse).get("token").asText();
    }
}
