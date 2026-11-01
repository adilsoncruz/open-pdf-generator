package main

import (
	"fmt"

	maroto "github.com/johnfercher/maroto/v2"
	"github.com/johnfercher/maroto/v2/pkg/components/code"
	"github.com/johnfercher/maroto/v2/pkg/components/col"
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/consts/align"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontstyle"
	"github.com/johnfercher/maroto/v2/pkg/core"
	"github.com/johnfercher/maroto/v2/pkg/props"
)

func renderInvoice(data InvoiceData) ([]byte, error) {
	m := maroto.New()

	m.AddRow(10,
		col.New(6).Add(text.New("ACME ENTERPRISE SOLUTIONS", props.Text{Size: 14, Style: fontstyle.Bold})),
		col.New(6).Add(text.New("INVOICE", props.Text{Size: 14, Style: fontstyle.Bold, Align: align.Right})),
	)
	m.AddRow(5,
		col.New(6).Add(text.New("Billed To:", props.Text{Size: 8, Style: fontstyle.Bold})),
		col.New(6).Add(text.New("Number: "+data.InvoiceNumber, props.Text{Size: 8, Align: align.Right})),
	)
	m.AddRow(6,
		col.New(6).Add(text.New(data.Customer.Name, props.Text{Size: 10, Style: fontstyle.Bold})),
		col.New(6).Add(text.New("Date: "+data.Date, props.Text{Size: 8, Align: align.Right})),
	)
	m.AddRow(4, col.New(6).Add(text.New(data.Customer.Email, props.Text{Size: 8})))
	m.AddRow(4, col.New(6).Add(text.New(data.Customer.Address, props.Text{Size: 8})))
	m.AddRow(4, col.New(12))

	m.AddRow(5,
		col.New(6).Add(text.New("Description", props.Text{Size: 8, Style: fontstyle.Bold})),
		col.New(2).Add(text.New("Qty", props.Text{Size: 8, Style: fontstyle.Bold, Align: align.Center})),
		col.New(2).Add(text.New("Unit Price", props.Text{Size: 8, Style: fontstyle.Bold, Align: align.Right})),
		col.New(2).Add(text.New("Total", props.Text{Size: 8, Style: fontstyle.Bold, Align: align.Right})),
	)
	for _, item := range data.Items {
		m.AddRow(4,
			col.New(6).Add(text.New(item.Description, props.Text{Size: 8})),
			col.New(2).Add(text.New(fmt.Sprintf("%d", item.Quantity), props.Text{Size: 8, Align: align.Center})),
			col.New(2).Add(text.New(fmt.Sprintf("%.2f", item.UnitPrice), props.Text{Size: 8, Align: align.Right})),
			col.New(2).Add(text.New(fmt.Sprintf("%.2f", item.Total), props.Text{Size: 8, Align: align.Right})),
		)
	}

	m.AddRow(4, col.New(12))
	m.AddRow(6,
		col.New(7).Add(text.New("Subtotal / Tax / Total", props.Text{Size: 8})),
		col.New(5).Add(text.New(fmt.Sprintf("%.2f / %.2f / %.2f", data.Subtotal, data.Tax, data.Total),
			props.Text{Size: 9, Style: fontstyle.Bold, Align: align.Right})),
	)

	return generatePDF(m)
}

func renderComplex(data ComplexData) ([]byte, error) {
	m := maroto.New()

	m.AddRow(10,
		col.New(8).Add(text.New(data.CompanyName, props.Text{Size: 14, Style: fontstyle.Bold})),
		col.New(4).Add(text.New("INVOICE", props.Text{Size: 14, Style: fontstyle.Bold, Align: align.Right})),
	)
	m.AddRow(5,
		col.New(8).Add(text.New("Number: "+data.InvoiceNumber, props.Text{Size: 8})),
		col.New(4).Add(text.New("Date: "+data.Date, props.Text{Size: 8, Align: align.Right})),
	)
	m.AddRow(8, col.New(12))

	m.AddRow(5,
		col.New(6).Add(text.New("Description", props.Text{Size: 8, Style: fontstyle.Bold})),
		col.New(2).Add(text.New("Qty", props.Text{Size: 8, Style: fontstyle.Bold, Align: align.Center})),
		col.New(2).Add(text.New("Unit Price", props.Text{Size: 8, Style: fontstyle.Bold, Align: align.Right})),
		col.New(2).Add(text.New("Total", props.Text{Size: 8, Style: fontstyle.Bold, Align: align.Right})),
	)
	for _, item := range data.Items {
		m.AddRow(4,
			col.New(6).Add(text.New(item.Description, props.Text{Size: 8})),
			col.New(2).Add(text.New(fmt.Sprintf("%d", item.Quantity), props.Text{Size: 8, Align: align.Center})),
			col.New(2).Add(text.New(fmt.Sprintf("%.2f", item.UnitPrice), props.Text{Size: 8, Align: align.Right})),
			col.New(2).Add(text.New(fmt.Sprintf("%.2f", item.Total), props.Text{Size: 8, Align: align.Right})),
		)
	}

	m.AddRow(6,
		col.New(8).Add(text.New("Total", props.Text{Size: 10, Style: fontstyle.Bold})),
		col.New(4).Add(text.New(fmt.Sprintf("%.2f", data.Total), props.Text{Size: 10, Style: fontstyle.Bold, Align: align.Right})),
	)
	m.AddRow(10, col.New(12))

	qtyRow := 26.0
	m.AddRow(qtyRow,
		col.New(4).Add(code.NewQr(data.QRCodePayload)),
		col.New(4).Add(code.NewBar(data.BarcodeValue)),
		col.New(4).Add(text.New(data.Notes, props.Text{Size: 7})),
	)

	return generatePDF(m)
}

func renderListing(data ListingData) ([]byte, error) {
	m := maroto.New()

	m.AddRow(8,
		col.New(8).Add(text.New(data.ReportTitle, props.Text{Size: 11, Style: fontstyle.Bold})),
		col.New(4).Add(text.New(data.GeneratedAt, props.Text{Size: 8, Align: align.Right})),
	)
	m.AddRow(5,
		col.New(1).Add(text.New("#", props.Text{Size: 7, Style: fontstyle.Bold, Align: align.Center})),
		col.New(2).Add(text.New("SKU", props.Text{Size: 7, Style: fontstyle.Bold})),
		col.New(5).Add(text.New("Product", props.Text{Size: 7, Style: fontstyle.Bold})),
		col.New(2).Add(text.New("Category", props.Text{Size: 7, Style: fontstyle.Bold})),
		col.New(1).Add(text.New("Stock", props.Text{Size: 7, Style: fontstyle.Bold, Align: align.Center})),
		col.New(1).Add(text.New("Price", props.Text{Size: 7, Style: fontstyle.Bold, Align: align.Right})),
	)

	for _, row := range data.Items {
		m.AddRow(4,
			col.New(1).Add(text.New(fmt.Sprintf("%d", row.ID), props.Text{Size: 7, Align: align.Center})),
			col.New(2).Add(text.New(row.Code, props.Text{Size: 7})),
			col.New(5).Add(text.New(row.Name, props.Text{Size: 7})),
			col.New(2).Add(text.New(row.Category, props.Text{Size: 7})),
			col.New(1).Add(text.New(fmt.Sprintf("%d", row.Stock), props.Text{Size: 7, Align: align.Center})),
			col.New(1).Add(text.New(fmt.Sprintf("%.2f", row.Price), props.Text{Size: 7, Align: align.Right})),
		)
	}

	return generatePDF(m)
}

func generatePDF(m core.Maroto) ([]byte, error) {
	document, err := m.Generate()
	if err != nil {
		return nil, err
	}
	return document.GetBytes(), nil
}
