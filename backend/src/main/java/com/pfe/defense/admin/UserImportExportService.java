package com.pfe.defense.admin;

import com.pfe.defense.admin.dto.UserImportIgnoredRowResponse;
import com.pfe.defense.admin.dto.UserImportResponse;
import com.pfe.defense.audit.AuditLogService;
import com.pfe.defense.common.BadRequestException;
import com.pfe.defense.user.Role;
import com.pfe.defense.user.User;
import com.pfe.defense.user.UserRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Transactional
public class UserImportExportService {
    private static final List<String> EXPECTED_HEADERS = List.of("firstname", "lastname", "email", "role", "department", "phone");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Value("${app.admin.default-import-password:ChangeMe@123}")
    private String defaultPassword;

    public UserImportExportService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public UserImportResponse importUsers(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Le fichier d'import est vide.");
        }
        String filename = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase(Locale.ROOT);
        try {
            List<ImportedUserRow> rows = filename.endsWith(".csv") ? readCsv(file) : readExcel(file);
            return persistRows(rows);
        } catch (IOException ex) {
            throw new BadRequestException("Impossible de lire le fichier d'import.");
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportCsv() {
        StringBuilder builder = new StringBuilder("firstName,lastName,email,role,department,phone,enabled\n");
        listUsersForExport().forEach(user -> builder
                .append(csv(user.getFirstName())).append(',')
                .append(csv(user.getLastName())).append(',')
                .append(csv(user.getEmail())).append(',')
                .append(csv(user.getRole().name())).append(',')
                .append(csv(user.getDepartment())).append(',')
                .append(csv(user.getPhone())).append(',')
                .append(user.isEnabled())
                .append('\n'));
        return builder.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Transactional(readOnly = true)
    public byte[] exportExcel() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Utilisateurs");
            String[] headers = {"Prénom", "Nom", "Email", "Rôle", "Département", "Téléphone", "Actif"};
            Row header = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            int rowIndex = 1;
            for (User user : listUsersForExport()) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(user.getFirstName());
                row.createCell(1).setCellValue(user.getLastName());
                row.createCell(2).setCellValue(user.getEmail());
                row.createCell(3).setCellValue(user.getRole().name());
                row.createCell(4).setCellValue(value(user.getDepartment()));
                row.createCell(5).setCellValue(value(user.getPhone()));
                row.createCell(6).setCellValue(user.isEnabled() ? "Oui" : "Non");
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(output);
            return output.toByteArray();
        } catch (IOException ex) {
            throw new BadRequestException("Impossible de générer l'export Excel.");
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportPdf() {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDType1Font regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDPage page = new PDPage();
            document.addPage(page);
            PDPageContentStream stream = new PDPageContentStream(document, page);
            float y = 760;
            stream.beginText();
            stream.setFont(bold, 16);
            stream.newLineAtOffset(50, y);
            stream.showText("Export utilisateurs");
            stream.endText();
            y -= 28;

            for (User user : listUsersForExport()) {
                if (y < 60) {
                    stream.close();
                    page = new PDPage();
                    document.addPage(page);
                    stream = new PDPageContentStream(document, page);
                    y = 760;
                }
                String line = user.getFirstName() + " " + user.getLastName() + " | " + user.getEmail() + " | " + user.getRole()
                        + " | " + value(user.getDepartment()) + " | " + (user.isEnabled() ? "Actif" : "Inactif");
                stream.beginText();
                stream.setFont(regular, 10);
                stream.newLineAtOffset(50, y);
                stream.showText(sanitizePdf(line));
                stream.endText();
                y -= 16;
            }
            stream.close();
            document.save(output);
            return output.toByteArray();
        } catch (IOException ex) {
            throw new BadRequestException("Impossible de générer l'export PDF.");
        }
    }

    private UserImportResponse persistRows(List<ImportedUserRow> rows) {
        List<UserImportIgnoredRowResponse> ignored = new ArrayList<>();
        Set<String> emailsSeenInFile = new HashSet<>();
        int imported = 0;
        for (ImportedUserRow row : rows) {
            String email = row.email().trim().toLowerCase(Locale.ROOT);
            String validationError = validate(row, email);
            if (validationError != null) {
                ignored.add(new UserImportIgnoredRowResponse(row.rowNumber(), email, validationError));
                continue;
            }
            if (!emailsSeenInFile.add(email)) {
                ignored.add(new UserImportIgnoredRowResponse(row.rowNumber(), email, "Email dupliqué dans le fichier."));
                continue;
            }
            if (userRepository.existsByEmailIgnoreCase(email)) {
                ignored.add(new UserImportIgnoredRowResponse(row.rowNumber(), email, "Email déjà existant."));
                continue;
            }
            User user = new User();
            user.setFirstName(row.firstName().trim());
            user.setLastName(row.lastName().trim());
            user.setEmail(email);
            user.setRole(Role.valueOf(row.role().trim().toUpperCase(Locale.ROOT)));
            user.setDepartment(blankToNull(row.department()));
            user.setPhone(blankToNull(row.phone()));
            user.setPassword(passwordEncoder.encode(defaultPassword));
            user.setEnabled(true);
            userRepository.save(user);
            imported++;
        }
        auditLogService.log("IMPORT", "ADMIN_USER", "Import utilisateurs : " + imported + " importé(s), " + ignored.size() + " ignoré(s)", currentActor());
        return new UserImportResponse(imported, ignored);
    }

    private String validate(ImportedUserRow row, String email) {
        if (row.firstName().isBlank() || row.lastName().isBlank() || email.isBlank() || row.role().isBlank()) {
            return "Champs obligatoires manquants.";
        }
        if (!email.contains("@")) {
            return "Email invalide.";
        }
        try {
            Role.valueOf(row.role().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return "Rôle invalide.";
        }
        return null;
    }

    private List<ImportedUserRow> readCsv(MultipartFile file) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new BadRequestException("Le fichier CSV ne contient pas d'en-tête.");
            }
            char delimiter = count(headerLine, ';') > count(headerLine, ',') ? ';' : ',';
            Map<String, Integer> indexes = headerIndexes(splitLine(headerLine, delimiter));
            List<ImportedUserRow> rows = new ArrayList<>();
            String line;
            int rowNumber = 1;
            while ((line = reader.readLine()) != null) {
                rowNumber++;
                if (line.isBlank()) {
                    continue;
                }
                List<String> values = splitLine(line, delimiter);
                rows.add(toImportedRow(rowNumber, indexes, values));
            }
            return rows;
        }
    }

    private List<ImportedUserRow> readExcel(MultipartFile file) throws IOException {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Row header = sheet.getRow(0);
            if (header == null) {
                throw new BadRequestException("Le fichier Excel ne contient pas d'en-tête.");
            }
            DataFormatter formatter = new DataFormatter();
            List<String> headerValues = new ArrayList<>();
            header.forEach(cell -> headerValues.add(formatter.formatCellValue(cell)));
            Map<String, Integer> indexes = headerIndexes(headerValues);
            List<ImportedUserRow> rows = new ArrayList<>();
            for (int index = 1; index <= sheet.getLastRowNum(); index++) {
                Row row = sheet.getRow(index);
                if (row == null) {
                    continue;
                }
                List<String> values = new ArrayList<>();
                for (int column = 0; column < headerValues.size(); column++) {
                    values.add(formatter.formatCellValue(row.getCell(column)));
                }
                if (values.stream().allMatch(String::isBlank)) {
                    continue;
                }
                rows.add(toImportedRow(index + 1, indexes, values));
            }
            return rows;
        }
    }

    private ImportedUserRow toImportedRow(int rowNumber, Map<String, Integer> indexes, List<String> values) {
        return new ImportedUserRow(
                rowNumber,
                value(values, indexes.get("firstname")),
                value(values, indexes.get("lastname")),
                value(values, indexes.get("email")),
                value(values, indexes.get("role")),
                value(values, indexes.get("department")),
                value(values, indexes.get("phone"))
        );
    }

    private Map<String, Integer> headerIndexes(List<String> headers) {
        Map<String, Integer> indexes = new HashMap<>();
        for (int i = 0; i < headers.size(); i++) {
            indexes.put(headers.get(i).trim().toLowerCase(Locale.ROOT), i);
        }
        if (!indexes.keySet().containsAll(EXPECTED_HEADERS)) {
            throw new BadRequestException("Colonnes attendues : firstName, lastName, email, role, department, phone.");
        }
        return indexes;
    }

    private List<String> splitLine(String line, char delimiter) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean quoted = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                quoted = !quoted;
            } else if (c == delimiter && !quoted) {
                values.add(current.toString().trim());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        values.add(current.toString().trim());
        return values;
    }

    private int count(String value, char target) {
        int total = 0;
        for (char c : value.toCharArray()) {
            if (c == target) {
                total++;
            }
        }
        return total;
    }

    private List<User> listUsersForExport() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "lastName", "firstName"));
    }

    private String value(String nullable) {
        return nullable == null ? "" : nullable;
    }

    private String value(List<String> values, Integer index) {
        return index == null || index >= values.size() ? "" : values.get(index);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String csv(String value) {
        String safe = value(value).replace("\"", "\"\"");
        return safe.contains(",") || safe.contains("\"") || safe.contains("\n") ? "\"" + safe + "\"" : safe;
    }

    private String sanitizePdf(String value) {
        return value.replace("é", "e").replace("è", "e").replace("ê", "e").replace("à", "a").replace("ç", "c");
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }

    private record ImportedUserRow(int rowNumber, String firstName, String lastName, String email, String role, String department, String phone) {
    }
}
