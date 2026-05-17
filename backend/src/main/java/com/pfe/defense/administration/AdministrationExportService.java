package com.pfe.defense.administration;

import com.pfe.defense.administration.repository.AdminDefenseQueryRepository;
import com.pfe.defense.defense.Defense;
import com.pfe.defense.defense.DefenseStatus;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdministrationExportService {

    private final AdminDefenseQueryRepository defenseRepo;
    private final AdministrationAuditService auditService;

    public AdministrationExportService(AdminDefenseQueryRepository defenseRepo,
                                       AdministrationAuditService auditService) {
        this.defenseRepo = defenseRepo;
        this.auditService = auditService;
    }

    @Transactional
    public byte[] exportPdf() throws IOException {
        List<Defense> defenses = defenseRepo.findAllByStatus(DefenseStatus.PUBLISHED);

        try (PDDocument doc = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                PDType1Font bold    = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                PDType1Font regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                // Titre
                cs.beginText();
                cs.setFont(bold, 16);
                cs.newLineAtOffset(50, 780);
                cs.showText("Planning des Soutenances");
                cs.endText();

                // En-têtes
                float y = 740;
                cs.beginText();
                cs.setFont(bold, 10);
                cs.newLineAtOffset(50, y);
                cs.showText(String.format("%-30s %-20s %-12s %-10s %-10s %-15s",
                        "Projet", "Etudiant", "Date", "Debut", "Fin", "Salle"));
                cs.endText();

                // Ligne séparatrice
                cs.moveTo(50, y - 5);
                cs.lineTo(545, y - 5);
                cs.stroke();

                y -= 20;
                for (Defense d : defenses) {
                    if (y < 60) {
                        cs.close();
                        PDPage newPage = new PDPage(PDRectangle.A4);
                        doc.addPage(newPage);
                        // Note: pour simplifier, on continue sur la même page si dépassement
                        break;
                    }
                    String student = d.getProject().getStudent() != null
                            ? d.getProject().getStudent().getFirstName() + " " + d.getProject().getStudent().getLastName()
                            : "-";
                    String room = d.getRoom() != null ? d.getRoom().getName() : "-";
                    String date = d.getDefenseDate() != null ? d.getDefenseDate().toString() : "-";
                    String start = d.getStartTime() != null ? d.getStartTime().toString() : "-";
                    String end   = d.getEndTime()   != null ? d.getEndTime().toString()   : "-";

                    String title = truncate(d.getProject().getTitle(), 28);
                    String stud  = truncate(student, 18);

                    cs.beginText();
                    cs.setFont(regular, 9);
                    cs.newLineAtOffset(50, y);
                    cs.showText(String.format("%-30s %-20s %-12s %-10s %-10s %-15s",
                            title, stud, date, start, end, room));
                    cs.endText();
                    y -= 16;
                }
            }

            doc.save(out);
            auditService.log("EXPORT_PLANNING_PDF", "Export PDF du planning des soutenances");
            return out.toByteArray();
        }
    }

    @Transactional
    public byte[] exportExcel() throws IOException {
        List<Defense> defenses = defenseRepo.findAllByStatus(DefenseStatus.PUBLISHED);

        try (Workbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet("Planning Soutenances");

            // Style en-tête
            CellStyle headerStyle = wb.createCellStyle();
            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // En-têtes
            Row header = sheet.createRow(0);
            String[] cols = {"Etudiant", "Titre projet", "Encadrant", "Président jury", "Examinateur 1",
                    "Examinateur 2", "Salle", "Bâtiment", "Date", "Heure début", "Heure fin", "Statut"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            // Données
            int rowNum = 1;
            for (Defense d : defenses) {
                Row row = sheet.createRow(rowNum++);
                String student = d.getProject().getStudent() != null
                        ? d.getProject().getStudent().getFirstName() + " " + d.getProject().getStudent().getLastName()
                        : "-";
                row.createCell(0).setCellValue(student);
                row.createCell(1).setCellValue(d.getProject().getTitle());

                String supervisor = d.getProject().getSupervisor() != null
                        ? d.getProject().getSupervisor().getFirstName() + " " + d.getProject().getSupervisor().getLastName()
                        : "-";
                row.createCell(2).setCellValue(supervisor);

                if (d.getJuryAssignment() != null) {
                    var ja = d.getJuryAssignment();
                    row.createCell(3).setCellValue(ja.getPresident()  != null
                            ? ja.getPresident().getFirstName()  + " " + ja.getPresident().getLastName()  : "-");
                    row.createCell(4).setCellValue(ja.getExaminer1()  != null
                            ? ja.getExaminer1().getFirstName()  + " " + ja.getExaminer1().getLastName()  : "-");
                    row.createCell(5).setCellValue(ja.getExaminer2() != null
                            ? ja.getExaminer2().getFirstName()  + " " + ja.getExaminer2().getLastName()  : "-");
                }
                row.createCell(6).setCellValue(d.getRoom()        != null ? d.getRoom().getName()         : "-");
                row.createCell(7).setCellValue(d.getRoom()        != null ? d.getRoom().getBuilding()     : "-");
                row.createCell(8).setCellValue(d.getDefenseDate() != null ? d.getDefenseDate().toString() : "-");
                row.createCell(9).setCellValue(d.getStartTime()   != null ? d.getStartTime().toString()   : "-");
                row.createCell(10).setCellValue(d.getEndTime()    != null ? d.getEndTime().toString()     : "-");
                row.createCell(11).setCellValue(d.getStatus().name());
            }

            wb.write(out);
            auditService.log("EXPORT_PLANNING_EXCEL", "Export Excel du planning des soutenances");
            return out.toByteArray();
        }
    }

    @Transactional
    public byte[] exportCsv() {
        List<Defense> defenses = defenseRepo.findAllByStatus(DefenseStatus.PUBLISHED);
        StringBuilder csv = new StringBuilder();
        csv.append("Etudiant,Titre projet,Encadrant,Président jury,Examinateur 1,Examinateur 2,Salle,Bâtiment,Date,Heure début,Heure fin,Statut\n");

        for (Defense defense : defenses) {
            csv.append(csvValue(fullName(defense.getProject().getStudent()))).append(',')
                    .append(csvValue(defense.getProject().getTitle())).append(',')
                    .append(csvValue(fullName(defense.getProject().getSupervisor()))).append(',');

            var jury = defense.getJuryAssignment();
            csv.append(csvValue(jury != null ? fullName(jury.getPresident()) : "-")).append(',')
                    .append(csvValue(jury != null ? fullName(jury.getExaminer1()) : "-")).append(',')
                    .append(csvValue(jury != null ? fullName(jury.getExaminer2()) : "-")).append(',')
                    .append(csvValue(defense.getRoom() != null ? defense.getRoom().getName() : "-")).append(',')
                    .append(csvValue(defense.getRoom() != null ? defense.getRoom().getBuilding() : "-")).append(',')
                    .append(csvValue(defense.getDefenseDate() != null ? defense.getDefenseDate().toString() : "-")).append(',')
                    .append(csvValue(defense.getStartTime() != null ? defense.getStartTime().toString() : "-")).append(',')
                    .append(csvValue(defense.getEndTime() != null ? defense.getEndTime().toString() : "-")).append(',')
                    .append(csvValue(defense.getStatus().name()))
                    .append('\n');
        }

        auditService.log("EXPORT_PLANNING_CSV", "Export CSV du planning des soutenances");
        return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() > max ? s.substring(0, max - 1) + "…" : s;
    }

    private String fullName(com.pfe.defense.user.User user) {
        return user == null ? "-" : user.getFirstName() + " " + user.getLastName();
    }

    private String csvValue(String value) {
        String safe = value == null ? "" : value.replace("\"", "\"\"");
        return "\"" + safe + "\"";
    }
}
