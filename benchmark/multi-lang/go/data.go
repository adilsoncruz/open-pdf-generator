package main

import "fmt"

// Mirrors com.pdfgenerator.benchmark.model.BenchmarkDataFactory so every engine
// generates documents from the same volume/shape of data.

type InvoiceItem struct {
	Description string  `json:"description"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unitPrice"`
	Total       float64 `json:"total"`
}

type Customer struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Address string `json:"address"`
}

type InvoiceData struct {
	InvoiceNumber string        `json:"invoiceNumber"`
	Date          string        `json:"date"`
	Customer      Customer      `json:"customer"`
	Items         []InvoiceItem `json:"items"`
	Subtotal      float64       `json:"subtotal"`
	Tax           float64       `json:"tax"`
	Total         float64       `json:"total"`
	IsDraft       bool          `json:"isDraft"`
}

// ComplexData mirrors the `complex` template scenario: invoice + QR + barcode + notes.
type ComplexData struct {
	InvoiceData
	CompanyName     string `json:"companyName"`
	QRCodePayload   string `json:"qrCodePayload"`
	BarcodeValue    string `json:"barcodeValue"`
	ShowLegalNotice bool   `json:"showLegalNotice"`
	Notes           string `json:"notes"`
}

type ListingRow struct {
	ID       int     `json:"id"`
	Code     string  `json:"code"`
	Name     string  `json:"name"`
	Category string  `json:"category"`
	Stock    int     `json:"stock"`
	Price    float64 `json:"price"`
	Status   string  `json:"status"`
}

type ListingData struct {
	ReportTitle string       `json:"reportTitle"`
	GeneratedAt string       `json:"generatedAt"`
	TotalCount  int          `json:"totalCount"`
	Items       []ListingRow `json:"items"`
}

func createInvoiceData(seq int) InvoiceData {
	items := make([]InvoiceItem, 0, 10)
	subtotal := 0.0
	for i := 1; i <= 10; i++ {
		qty := ((seq + i) % 5) + 1
		price := 15.0*float64(i) + float64(seq%10)
		total := float64(qty) * price
		subtotal += total
		items = append(items, InvoiceItem{
			Description: fmt.Sprintf("Item #%d - Enterprise Module Pack (Batch #%d)", i, seq),
			Quantity:    qty,
			UnitPrice:   price,
			Total:       total,
		})
	}
	tax := subtotal * 0.1
	return InvoiceData{
		InvoiceNumber: fmt.Sprintf("INV-2026-%06d", seq),
		Date:          "2026-10-21",
		Customer: Customer{
			Name:    fmt.Sprintf("Customer #%d Global Industries", seq),
			Email:   fmt.Sprintf("client-%d@globalcorp.internal", seq),
			Address: fmt.Sprintf("%d Enterprise Way, Suite 400, Austin, TX", seq),
		},
		Items:    items,
		Subtotal: subtotal,
		Tax:      tax,
		Total:    subtotal + tax,
		IsDraft:  false,
	}
}

func createListingData(count int) ListingData {
	rows := make([]ListingRow, 0, count)
	for i := 1; i <= count; i++ {
		category := "Software"
		if i%2 == 0 {
			category = "Hardware"
		}
		status := "BACKORDER"
		if i%3 == 0 {
			status = "IN_STOCK"
		}
		rows = append(rows, ListingRow{
			ID:       i,
			Code:     fmt.Sprintf("SKU-%05d", i),
			Name:     fmt.Sprintf("Product Inventory Unit #%d", i),
			Category: category,
			Stock:    (i * 7) % 500,
			Price:    10.0 + float64(i%100)*1.5,
			Status:   status,
		})
	}
	return ListingData{
		ReportTitle: fmt.Sprintf("Consolidated Inventory Catalog (%d items)", count),
		GeneratedAt: "2026-10-21 15:00:00",
		TotalCount:  count,
		Items:       rows,
	}
}

func createComplexData() ComplexData {
	return ComplexData{
		InvoiceData:     createInvoiceData(1),
		CompanyName:     "Apex Cloud Solutions",
		QRCodePayload:   "https://apexcloud.internal/verify/INV-2026-9042",
		BarcodeValue:    "7891234567890",
		ShowLegalNotice: true,
		Notes:           "Payment due within 30 days. Contact support@apexcloud.internal for questions.",
	}
}
