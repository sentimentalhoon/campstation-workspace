package com.campstation.camp.reservation.service;

import com.campstation.camp.reservation.domain.Payment;
import com.campstation.camp.reservation.domain.Reservation;
import com.campstation.camp.reservation.repository.ReservationRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceiptService {

    private final ReservationRepository reservationRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public byte[] generateReceiptPdf(Payment payment) {
        Reservation reservation = reservationRepository.findById(payment.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found: " + payment.getReservationId()));

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Title
            Paragraph title = new Paragraph("CampStation - Payment Receipt")
                    .setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(title);

            // Receipt Info
            document.add(new Paragraph("Receipt Number: " + payment.getId())
                    .setMarginBottom(10));
            document.add(new Paragraph("Payment Date: " + payment.getCreatedAt().format(DATE_FORMATTER))
                    .setMarginBottom(10));
            document.add(new Paragraph("Payment Method: " + payment.getPaymentMethod())
                    .setMarginBottom(20));

            // Customer Info
            document.add(new Paragraph("Customer Information:")
                    .setFontSize(14)
                    .setMarginBottom(10));
            document.add(new Paragraph("Name: " + reservation.getUser().getName())
                    .setMarginBottom(5));
            document.add(new Paragraph("Email: " + reservation.getUser().getEmail())
                    .setMarginBottom(20));

            // Reservation Details
            document.add(new Paragraph("Reservation Details:")
                    .setFontSize(14)
                    .setMarginBottom(10));

            Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2, 2}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(20);

            table.addHeaderCell("Campground");
            table.addHeaderCell("Check-in");
            table.addHeaderCell("Check-out");

            table.addCell(reservation.getCampground().getName());
            table.addCell(reservation.getCheckInDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            table.addCell(reservation.getCheckOutDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

            document.add(table);

            // Payment Summary
            document.add(new Paragraph("Payment Summary:")
                    .setFontSize(14)
                    .setMarginBottom(10));

            Table paymentTable = new Table(UnitValue.createPercentArray(new float[]{3, 2}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginBottom(20);

            paymentTable.addHeaderCell("Description");
            paymentTable.addHeaderCell("Amount");

            paymentTable.addCell("Reservation Total");
            paymentTable.addCell("$" + String.format("%.2f", payment.getAmount()));

            paymentTable.addCell("Total Paid");
            paymentTable.addCell("$" + String.format("%.2f", payment.getAmount()));

            document.add(paymentTable);

            // Footer
            document.add(new Paragraph("Thank you for choosing CampStation!")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(30));

            document.close();

            log.info("Generated PDF receipt for payment ID: {}", payment.getId());
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Error generating PDF receipt for payment ID: {}", payment.getId(), e);
            throw new RuntimeException("Failed to generate receipt PDF", e);
        }
    }
}