import io
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# ─── Numbered Canvas For Page X Of Y Pagination ──────────────────────────────
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(HexColor("#4f46e5")) # Primary Accent Color
        
        # Header - Suppressed on the first page
        if self._pageNumber > 1:
            self.drawString(54, 755, "ALIAS ACADEMIC MANAGEMENT SYSTEM")
            self.setFont("Helvetica", 8)
            self.setFillColor(HexColor("#64748b"))
            self.drawRightString(558, 755, "STUDENT STUDY NOTES & CIRCULARS")
            self.setStrokeColor(HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 747, 558, 747)
            
        # Footer - Shown on all pages
        self.setStrokeColor(HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 52, 558, 52)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(HexColor("#64748b"))
        self.drawString(54, 38, "© 2026 ALIAS Institute. All rights reserved.")
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 38, page_text)
        self.restoreState()

# ─── Document-Specific Header Canvas (For Fee Receipt and Aadhaar) ────────────
# Used for single page documents that don't need "Page X of Y" or standard headers
class MinimalCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
    def showPage(self):
        self.saveState()
        # Simple subtle footer
        self.setStrokeColor(HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.setFont("Helvetica", 8)
        self.setFillColor(HexColor("#94a3b8"))
        self.drawString(54, 32, "This is a digitally generated copy and does not require a physical signature.")
        self.drawRightString(558, 32, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        self.restoreState()
        super().showPage()


# ─── PDF Generation Functions ──────────────────────────────────────────────────

def build_pdf_buffer(elements, canvas_maker=NumberedCanvas):
    """Utility to build document into an in-memory buffer."""
    buffer = io.BytesIO()
    # 0.75 inch margins
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    doc.build(elements, canvasmaker=canvas_maker)
    buffer.seek(0)
    return buffer


def generate_notes_pdf(course_id: str, note_title: str) -> io.BytesIO:
    """Generates highly detailed, beautiful multi-page lecture notes for a course."""
    styles = getSampleStyleSheet()
    
    # Custom Palette and Typography
    primary_color = HexColor("#4f46e5")  # Indigo
    secondary_color = HexColor("#ec4899")  # Pink
    text_color = HexColor("#1e293b")  # Dark Slate
    bg_code_color = HexColor("#f1f5f9")  # Light Grey
    
    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=secondary_color,
        spaceAfter=15,
        textTransform='uppercase'
    )
    
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=secondary_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=text_color,
        spaceAfter=10
    )
    
    code_style = ParagraphStyle(
        'Code',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=HexColor("#0f172a"),
        backColor=bg_code_color,
        borderColor=HexColor("#cbd5e1"),
        borderWidth=0.5,
        borderPadding=8,
        spaceBefore=8,
        spaceAfter=8
    )
    
    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=6
    )
    
    meta_style = ParagraphStyle(
        'Meta',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=HexColor("#64748b")
    )
    
    elements = []
    
    # ─── HEADER / COVER BLOCK ───
    elements.append(Paragraph(f"{course_id} — {get_course_name(course_id)}", subtitle_style))
    elements.append(Paragraph(note_title, title_style))
    
    meta_text = (
        f"<b>Department:</b> Computer Science & Engineering | "
        f"<b>Instructor:</b> {get_course_instructor(course_id)}<br/>"
        f"<b>Syllabus Ref:</b> Visvesvaraya Technological University (VTU) Choice Based Credit System (CBCS)<br/>"
        f"<b>Document Class:</b> Authoritative Study Notes | <b>Revision:</b> Spring 2026"
    )
    elements.append(Paragraph(meta_text, meta_style))
    elements.append(Spacer(1, 15))
    
    # Beautiful horizontal line separating header
    divider = Table([[""]], colWidths=[504])
    divider.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,-1), 1.5, primary_color),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    elements.append(divider)
    elements.append(Spacer(1, 15))
    
    # ─── DYNAMIC MULTI-PAGE CONTENT GENERATION ───
    content_map = get_note_content(course_id, note_title)
    
    for section in content_map:
        sec_type = section.get("type", "p")
        text = section.get("text", "")
        
        if sec_type == "h1":
            elements.append(Paragraph(text, h1_style))
        elif sec_type == "h2":
            elements.append(Paragraph(text, h2_style))
        elif sec_type == "code":
            elements.append(Paragraph(text.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))
        elif sec_type == "bullet":
            elements.append(Paragraph(f"• &nbsp; {text}", bullet_style))
        elif sec_type == "pagebreak":
            elements.append(PageBreak())
        elif sec_type == "table":
            # Highly structured comparison tables
            headers = section.get("headers", [])
            rows = section.get("rows", [])
            
            table_data = [[Paragraph(f"<b>{h}</b>", body_style) for h in headers]]
            for row in rows:
                table_data.append([Paragraph(cell, body_style) for cell in row])
                
            col_widths = section.get("col_widths", [168] * len(headers))
            t = Table(table_data, colWidths=col_widths)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), HexColor("#eff6ff")),
                ('LINEBELOW', (0,0), (-1,0), 1, primary_color),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('INNERGRID', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
                ('BOX', (0,0), (-1,-1), 0.5, primary_color),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING', (0,0), (-1,-1), 8),
                ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ]))
            elements.append(Spacer(1, 5))
            elements.append(t)
            elements.append(Spacer(1, 10))
        else:
            elements.append(Paragraph(text, body_style))
            
    return build_pdf_buffer(elements, NumberedCanvas)


def generate_fee_receipt_pdf(txn_data: dict, student_data: dict) -> io.BytesIO:
    """Generates a highly realistic, professional fee payment receipt."""
    styles = getSampleStyleSheet()
    
    primary_color = HexColor("#4f46e5")
    text_color = HexColor("#1e293b")
    
    title_style = ParagraphStyle(
        'ReceiptTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color,
        alignment=1, # Center
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'ReceiptSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=HexColor("#64748b"),
        alignment=1,
        spaceAfter=15
    )
    
    label_style = ParagraphStyle(
        'ReceiptLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=HexColor("#475569")
    )
    
    value_style = ParagraphStyle(
        'ReceiptValue',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=text_color
    )
    
    elements = []
    
    # ─── HEADER / COLLEGE BRANDING ───
    elements.append(Paragraph("ALIAS ENGINEERING COLLEGE", title_style))
    elements.append(Paragraph("Approved by AICTE, Affiliated to VTU • Campus Heights, Bangalore 560098", subtitle_style))
    
    # Receipt Banner Tag
    tag_data = [[Paragraph("<font color='white'><b>OFFICIAL PAYMENT RECEIPT</b></font>", ParagraphStyle('Tag', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, alignment=1))]]
    tag_table = Table(tag_data, colWidths=[504])
    tag_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(tag_table)
    elements.append(Spacer(1, 15))
    
    # ─── TRANSACTION & STUDENT DETAILS ───
    details_data = [
        [Paragraph("Transaction ID:", label_style), Paragraph(txn_data.get('id', 'TXN_N/A'), value_style),
         Paragraph("Receipt Date:", label_style), Paragraph(txn_data.get('date', datetime.now().strftime('%Y-%m-%d')), value_style)],
        [Paragraph("Student Name:", label_style), Paragraph(student_data.get('name', 'Ansika Singh'), value_style),
         Paragraph("USN / ID:", label_style), Paragraph(student_data.get('usn', '1XX22CS042'), value_style)],
        [Paragraph("Branch / Dept:", label_style), Paragraph(student_data.get('branch', 'CSE'), value_style),
         Paragraph("Current Sem:", label_style), Paragraph(f"Semester {student_data.get('semester', '6')}", value_style)],
        [Paragraph("Payment Mode:", label_style), Paragraph("Online NetBanking / UPI", value_style),
         Paragraph("Payment Status:", label_style), Paragraph("<font color='#16a34a'><b>SUCCESS / PAID</b></font>", value_style)]
    ]
    details_table = Table(details_data, colWidths=[90, 162, 90, 162])
    details_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('LINEBELOW', (0,0), (-1,-1), 0.25, HexColor("#cbd5e1")),
    ]))
    elements.append(details_table)
    elements.append(Spacer(1, 20))
    
    # ─── ITEMIZED FEES TABLE ───
    amount = txn_data.get('amount', 50000)
    
    # Dynamically allocate items
    tuition = round(amount * 0.70, 2)
    library = round(amount * 0.10, 2)
    lab = round(amount * 0.12, 2)
    sports = round(amount * 0.08, 2)
    
    fee_items = [
        ["#", "Fee Description", "Quantity", "Unit Price (INR)", "Total (INR)"],
        ["1", "Tuition Fee — Undergraduate Engineering", "1 Semester", f"₹{tuition:,.2f}", f"₹{tuition:,.2f}"],
        ["2", "Digital Library Access & E-Journal Subscriptions", "1 Year", f"₹{library:,.2f}", f"₹{library:,.2f}"],
        ["3", "Computer Lab & Cloud Sandbox Infrastructure Fees", "1 Semester", f"₹{lab:,.2f}", f"₹{lab:,.2f}"],
        ["4", "Campus Sports & Gymkhana Facilities Fee", "1 Year", f"₹{sports:,.2f}", f"₹{sports:,.2f}"],
        ["", "", "", "Subtotal:", f"₹{amount:,.2f}"],
        ["", "", "", "CGST (0%):", "₹0.00"],
        ["", "", "", "SGST (0%):", "₹0.00"],
        ["", "", "", "Total Amount Paid:", f"₹{amount:,.2f}"]
    ]
    
    formatted_items = []
    for i, row in enumerate(fee_items):
        is_header = i == 0
        is_total = i >= len(fee_items) - 4
        
        row_style = ParagraphStyle(
            f'Row_{i}', parent=styles['Normal'],
            fontName='Helvetica-Bold' if (is_header or is_total) else 'Helvetica',
            fontSize=9 if is_header else 8.5,
            alignment=2 if (is_total and row[3] != "") else 0
        )
        formatted_items.append([Paragraph(cell, row_style) for cell in row])
        
    fee_table = Table(formatted_items, colWidths=[24, 216, 60, 100, 104])
    fee_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), HexColor("#eff6ff")),
        ('LINEBELOW', (0,0), (-1,0), 1, primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-5), 0.5, HexColor("#e2e8f0")),
        ('INNERGRID', (3,-4), (-1,-1), 0.5, HexColor("#cbd5e1")),
        ('BOX', (3,-4), (-1,-1), 1, primary_color),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(fee_table)
    elements.append(Spacer(1, 20))
    
    # ─── TERMS, SEAL & SIGNATURES ───
    bottom_data = [
        [
            Paragraph(
                "<b>Important Terms & Conditions:</b><br/>"
                "1. Fees once paid are non-refundable and non-transferable under any circumstances.<br/>"
                "2. Please preserve this receipt carefully. It must be presented for exam hall ticket clearance.<br/>"
                "3. In case of online payment delays, reconciliation takes up to 48 working hours.",
                ParagraphStyle('Terms', parent=styles['Normal'], fontSize=7.5, leading=10, textColor=HexColor("#64748b"))
            ),
            # Official Stamp and Approved Placeholder
            Table([
                [Paragraph("<font color='#16a34a'><b>★ VERIFIED ONLINE ★</b></font>", ParagraphStyle('Stamp', fontName='Helvetica-Bold', fontSize=10, alignment=1))],
                [Paragraph(f"Ref ID: {txn_data.get('id', 'TXN_N/A')}", ParagraphStyle('StampSub', fontSize=7, alignment=1))],
                [Paragraph("ALIAS Accounts Office", ParagraphStyle('StampDept', fontName='Helvetica-Oblique', fontSize=7.5, alignment=1))]
            ], colWidths=[180])
        ]
    ]
    bottom_table = Table(bottom_data, colWidths=[314, 190])
    bottom_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LINELEFT', (1,0), (1,0), 1, HexColor("#e2e8f0")),
        ('LEFTPADDING', (1,0), (1,0), 10),
    ]))
    elements.append(bottom_table)
    
    return build_pdf_buffer(elements, MinimalCanvas)


def generate_document_vault_pdf(doc_name: str, student_data: dict) -> io.BytesIO:
    """Generates official academic board transcripts and ID cards (Aadhaar)."""
    styles = getSampleStyleSheet()
    elements = []
    
    primary_color = HexColor("#1e3a8a") # Classic Navy
    
    title_style = ParagraphStyle(
        'DocHeader',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=primary_color,
        alignment=1,
        spaceAfter=2
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=HexColor("#dc2626"), # Crimson red
        alignment=1,
        spaceAfter=15
    )
    
    label_style = ParagraphStyle(
        'DocLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=HexColor("#475569")
    )
    value_style = ParagraphStyle(
        'DocValue', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=11, textColor=HexColor("#0f172a")
    )
    
    # ─── DOCUMENT 1: 10th / 12th MARKSHEET ───
    if "marksheet" in doc_name.lower():
        is_12th = "12th" in doc_name
        board_name = (
            "DEPARTMENT OF PRE-UNIVERSITY EDUCATION, KARNATAKA" if is_12th else 
            "CENTRAL BOARD OF SECONDARY EDUCATION, INDIA"
        )
        exam_name = (
            "SECOND YEAR PRE-UNIVERSITY EXAMINATION" if is_12th else 
            "SECONDARY SCHOOL CURRICULUM EXAMINATION (CLASS X)"
        )
        
        elements.append(Paragraph(board_name, title_style))
        elements.append(Paragraph(exam_name, subtitle_style))
        
        # Student demographic details
        roll_lbl = "Register No:" if is_12th else "Roll Number:"
        demo_data = [
            [Paragraph(roll_lbl, label_style), Paragraph("220914820", value_style),
             Paragraph("Candidate Name:", label_style), Paragraph(student_data.get('name', 'Ansika Singh').upper(), value_style)],
            [Paragraph("Mother's Name:", label_style), Paragraph("SUSHMA SINGH", value_style),
             Paragraph("Father's Name:", label_style), Paragraph("RAKESH SINGH", value_style)],
            [Paragraph("School/College:", label_style), Paragraph("ST. JOSEPH'S CONVENT HIGH SCHOOL", value_style),
             Paragraph("Date of Birth:", label_style), Paragraph("15-05-2004", value_style)]
        ]
        demo_table = Table(demo_data, colWidths=[90, 162, 90, 162])
        demo_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('GRID', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
        ]))
        elements.append(demo_table)
        elements.append(Spacer(1, 15))
        
        # Marksheet Table
        subjects = (
            [
                ["101", "ENGLISH", "100", "035", "090", "N/A", "090", "A1"],
                ["104", "KANNADA / HINDI", "100", "035", "095", "N/A", "095", "A1"],
                ["301", "PHYSICS", "070", "025", "065", "030", "095", "A1"],
                ["302", "CHEMISTRY", "070", "025", "062", "030", "092", "A1"],
                ["303", "MATHEMATICS", "100", "035", "098", "N/A", "098", "A1"],
                ["304", "COMPUTER SCIENCE", "070", "025", "069", "030", "099", "A1"]
            ] if is_12th else 
            [
                ["101", "ENGLISH COMM.", "080", "020", "074", "018", "092", "A1"],
                ["002", "HINDI COURSE-A", "080", "020", "076", "019", "095", "A1"],
                ["041", "MATHEMATICS", "080", "020", "078", "020", "098", "A1"],
                ["086", "SCIENCE", "080", "020", "075", "019", "094", "A1"],
                ["087", "SOCIAL SCIENCE", "080", "020", "077", "018", "095", "A1"],
                ["165", "FOUNDATION OF IT", "040", "060", "038", "058", "096", "A1"]
            ]
        )
        
        marks_header = [
            [Paragraph("<b>SUB<br/>CODE</b>", label_style),
             Paragraph("<b>SUBJECT NAME</b>", label_style),
             Paragraph("<b>MAX<br/>MARKS</b>", label_style),
             Paragraph("<b>MIN<br/>MARKS</b>", label_style),
             Paragraph("<b>THEORY<br/>OBT</b>", label_style),
             Paragraph("<b>PRACTICAL<br/>OBT</b>", label_style),
             Paragraph("<b>TOTAL<br/>OBT</b>", label_style),
             Paragraph("<b>GRADE</b>", label_style)]
        ]
        
        for sub in subjects:
            marks_header.append([Paragraph(cell, value_style) for cell in sub])
            
        # Grand Total Calculations
        grand_total = sum(int(sub[6]) for sub in subjects)
        max_total = sum(int(sub[2]) for sub in subjects) + sum(30 if sub[5] != "N/A" and is_12th else 0 for sub in subjects)
        if not is_12th:
            max_total = 600
            
        pct = (grand_total / max_total * 100)
        result_text = f"<b>GRAND TOTAL: {grand_total} / {max_total} &nbsp; | &nbsp; PERCENTAGE: {pct:.2f}% &nbsp; | &nbsp; RESULT: <font color='green'>PASS (DISTINCTION)</font></b>"
        marks_header.append([Paragraph(result_text, ParagraphStyle('Total', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5)), "", "", "", "", "", "", ""])
        
        marks_table = Table(marks_header, colWidths=[44, 150, 48, 48, 54, 60, 54, 46])
        marks_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), HexColor("#f1f5f9")),
            ('LINEBELOW', (0,0), (-1,0), 1, primary_color),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-2), 0.5, HexColor("#cbd5e1")),
            ('BOX', (0,0), (-1,-1), 1, primary_color),
            ('SPAN', (-8,-1), (-1,-1)), # Span grand total across
            ('BACKGROUND', (0,-1), (-1,-1), HexColor("#eff6ff")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        elements.append(marks_table)
        elements.append(Spacer(1, 20))
        
        # Signatures
        sig_data = [
            [Paragraph("Date of Declaration: 12-05-2022", value_style),
             Paragraph("<b>Controller of Examinations</b><br/>CBSE / Karnataka PUE Board", ParagraphStyle('Sig', parent=styles['Normal'], fontSize=8.5, alignment=2))]
        ]
        sig_table = Table(sig_data, colWidths=[250, 254])
        elements.append(sig_table)

    # ─── DOCUMENT 2: ENTRANCE RANK CARD ───
    elif "rank" in doc_name.lower() or "entrance" in doc_name.lower():
        elements.append(Paragraph("KARNATAKA EXAMINATIONS AUTHORITY, BANGALORE", title_style))
        elements.append(Paragraph("COMMON ENTRANCE TEST (KCET) RANK CARD", subtitle_style))
        
        demo_data = [
            [Paragraph("CET Number:", label_style), Paragraph("TT089", value_style),
             Paragraph("Candidate Name:", label_style), Paragraph(student_data.get('name', 'Ansika Singh').upper(), value_style)],
            [Paragraph("Branch preference:", label_style), Paragraph("COMPUTER SCIENCE", value_style),
             Paragraph("USN Reference:", label_style), Paragraph(student_data.get('usn', '1XX22CS042'), value_style)]
        ]
        demo_table = Table(demo_data, colWidths=[100, 152, 100, 152])
        demo_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(demo_table)
        elements.append(Spacer(1, 20))
        
        # Scores Table
        score_header = [
            [Paragraph("<b>SUBJECT</b>", label_style),
             Paragraph("<b>CET MARKS OBTAINED</b>", label_style),
             Paragraph("<b>BOARD PERCENTILE</b>", label_style),
             Paragraph("<b>QUALIFYING STATUS</b>", label_style)]
        ]
        scores = [
            ["PHYSICS", "52 / 60", "96.40%", "ELIGIBLE"],
            ["CHEMISTRY", "55 / 60", "98.20%", "ELIGIBLE"],
            ["MATHEMATICS", "58 / 60", "99.10%", "ELIGIBLE"]
        ]
        for s in scores:
            score_header.append([Paragraph(cell, value_style) for cell in s])
            
        score_table = Table(score_header, colWidths=[126, 126, 126, 126])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), HexColor("#eff6ff")),
            ('GRID', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
            ('BOX', (0,0), (-1,-1), 1.5, primary_color),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(score_table)
        elements.append(Spacer(1, 20))
        
        # Ranks Block
        rank_header = [
            [Paragraph("<b>DISCIPLINE</b>", label_style), Paragraph("<b>ASSIGNED RANK (STATE-WIDE)</b>", label_style)]
        ]
        ranks = [
            ["ENGINEERING (B.E / B.TECH)", "<b>482</b> (GENERAL MERIT)"],
            ["BACHELOR OF PHARMACY (B.PHARM)", "<b>621</b> (GENERAL MERIT)"],
            ["FARM SCIENCE (B.SC AGRI)", "<b>1204</b> (GENERAL MERIT)"]
        ]
        for r in ranks:
            rank_header.append([Paragraph(r[0], value_style), Paragraph(r[1], value_style)])
            
        rank_table = Table(rank_header, colWidths=[252, 252])
        rank_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), HexColor("#fef2f2")),
            ('GRID', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
            ('BOX', (0,0), (-1,-1), 1.5, HexColor("#dc2626")),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(rank_table)

    # ─── DOCUMENT 3: MOCK AADHAAR CARD ───
    else:
        # Aadhaar Government Banner
        header_text = (
            "<font size=10 color='#1e3a8a'><b>GOVERNMENT OF INDIA</b></font><br/>"
            "<font size=7 color='#64748b'>Unique Identification Authority of India (UIDAI)</font>"
        )
        elements.append(Paragraph(header_text, ParagraphStyle('AadhaarHeader', parent=styles['Normal'], alignment=1)))
        elements.append(Spacer(1, 15))
        
        # Student mock avatar box and details
        photo_box = Table([["<font color='white'>PHOTO</font>"]], colWidths=[70], rowHeights=[85])
        photo_box.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), HexColor("#475569")),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        
        # Card Graphic Block Table
        # Left side: Photo & details, Right side: Aadhaar badge
        id_data = [
            [
                # Left Column: Profile Photo box and details
                Table([
                    [
                        photo_box,
                        # Text details
                        Table([
                            [Paragraph("<b>Name:</b> Ansika Singh", value_style)],
                            [Paragraph("<b>DOB:</b> 15/05/2004", value_style)],
                            [Paragraph("<b>Gender:</b> Female", value_style)],
                            [Paragraph("<b>USN:</b> 1XX22CS042", value_style)],
                        ], colWidths=[150])
                    ]
                ], colWidths=[80, 150])
            ],
            [
                # Large Aadhaar Number row
                Paragraph("<font size=16 color='#1e3a8a'><b>8374 9283 0182</b></font>", ParagraphStyle('AadhaarNo', alignment=1, spaceBefore=8, spaceAfter=8))
            ],
            [
                # Aadhaar Branding Slogan
                Paragraph("<font color='#dc2626'><b>Mera Aadhaar, Meri Pehchan</b></font>", ParagraphStyle('AadhaarSlogan', alignment=1, fontSize=8, fontName='Helvetica-Bold'))
            ]
        ]
        
        card_table = Table(id_data, colWidths=[360])
        card_table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1.5, HexColor("#f97316")), # Aadhaar orange border
            ('BACKGROUND', (0,0), (-1,-1), HexColor("#fff7ed")), # Very light orange bg
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ]))
        
        # Center the Aadhaar card on the page using a wrapper table
        elements.append(Spacer(1, 10))
        elements.append(Table([[card_table]], colWidths=[504], hAlign='CENTER'))
        elements.append(Spacer(1, 20))
        
        # Back side of Aadhaar Card
        back_data = [
            [
                Paragraph(
                    "<b>Address:</b><br/>"
                    "C/O Rakesh Singh, 123, Campus Heights Road,<br/>"
                    "RR Nagar, Bangalore, Karnataka, 560098",
                    value_style
                )
            ],
            [
                Paragraph("<font size=14 color='#1e3a8a'><b>8374 9283 0182</b></font>", ParagraphStyle('AadhaarNoB', alignment=1, spaceBefore=8, spaceAfter=8))
            ],
            [
                Paragraph("<b>Helpdesk:</b> 1947 | help@uidai.gov.in | www.uidai.gov.in", ParagraphStyle('AadhaarHelp', alignment=1, fontSize=7, textColor=HexColor("#64748b")))
            ]
        ]
        back_table = Table(back_data, colWidths=[360])
        back_table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1.5, HexColor("#f97316")),
            ('BACKGROUND', (0,0), (-1,-1), HexColor("#fff7ed")),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ]))
        
        elements.append(Table([[back_table]], colWidths=[504], hAlign='CENTER'))

    return build_pdf_buffer(elements, MinimalCanvas)


# ─── HELPER HELPERS ──────────────────────────────────────────────────────────

def get_course_name(course_id: str) -> str:
    names = {
        'CS501': 'Distributed Systems',
        'CS502': 'Machine Learning',
        'CS503': 'Software Engineering',
        'CS504': 'Digital Image Processing'
    }
    return names.get(course_id, "Advanced Computer Science")


def get_course_instructor(course_id: str) -> str:
    instructors = {
        'CS501': 'Dr. Sarah Wilson',
        'CS502': 'Prof. James Chen',
        'CS503': 'Dr. Elena Rodriguez',
        'CS504': 'Dr. Michael Brown'
    }
    return instructors.get(course_id, "Department Faculty")


def get_note_content(course_id: str, title: str) -> list:
    """Returns granular, multi-page layout structures containing realistic academic notes."""
    
    # ─── 1. MACHINE LEARNING: NEURAL NETWORKS ───
    if "neural network" in title.lower():
        return [
            {"type": "h1", "text": "Unit 3: Deep Learning Foundations — Artificial Neural Networks"},
            {"type": "p", "text": "Artificial Neural Networks (ANNs) represent a cornerstone of modern Deep Learning, inspired by biological neurons in the human brain. They form mapping systems capable of learning complex non-linear functions from input data."},
            
            {"type": "h2", "text": "1. Biological vs. Artificial Neurons"},
            {"type": "p", "text": "A biological neuron consists of dendrites (receivers), a cell body (processing center), and an axon (transmitter). In an Artificial Neuron (the Perceptron model), dendrites correspond to weight vectors, the cell body is represented by a weighted summing junction and activation function, and the axon outputs the output value."},
            
            {"type": "table", "headers": ["Biological Component", "ANN Equivalent", "Mathematical Description"],
             "col_widths": [130, 130, 244],
             "rows": [
                 ["Dendrites", "Inputs & Weights", "Input feature vector x multiplied by weights w"],
                 ["Cell Body (Soma)", "Summing Junction & Activation", "z = sum(w_i * x_i) + b followed by activation a = f(z)"],
                 ["Axon / Synapse", "Axonal Output / Connection", "Activation a transmitted to subsequent downstream nodes"]
             ]},
            
            {"type": "h2", "text": "2. The Activation Function"},
            {"type": "p", "text": "Without non-linear activation functions, a multi-layer neural network collapses into a simple linear regression model, regardless of how many layers are stacked. The activation function squashes the input domain into a bounded output range, introducing non-linearity."},
            {"type": "bullet", "text": "<b>Sigmoid Function:</b> Maps inputs to a range (0, 1). Highly susceptible to the 'vanishing gradient problem'. Equation: f(z) = 1 / (1 + e^-z)."},
            {"type": "bullet", "text": "<b>Rectified Linear Unit (ReLU):</b> Outputs z if positive, zero otherwise. Solves vanishing gradients but can cause 'dying ReLUs'. Equation: f(z) = max(0, z)."},
            {"type": "bullet", "text": "<b>Hyperbolic Tangent (Tanh):</b> Zero-centered mapping between (-1, 1). Mathematically: f(z) = (e^z - e^-z) / (e^z + e^-z)."},
            
            {"type": "pagebreak"}, # Break to next page for Backpropagation Math
            
            {"type": "h1", "text": "3. The Backpropagation Algorithm"},
            {"type": "p", "text": "Backpropagation is the core mechanism used to train neural networks. It calculates the gradient of the loss function with respect to the weights using the chain rule of calculus, flowing backward from the output layer to the input layer."},
            
            {"type": "h2", "text": "Step-by-Step Mathematical Derivation"},
            {"type": "p", "text": "Let us consider a single training instance (x, y). Let the net input to a neuron in layer L be z^(L) = W^(L) * a^(L-1) + b^(L), where a^(L-1) is the activation of the previous layer. The output activation is a^(L) = f(z^(L))."},
            {"type": "p", "text": "Using Mean Squared Error loss: C = 0.5 * (y - a^(L))^2. To update weights, we find the partial derivative of C with respect to weight W_jk in layer L:"},
            
            {"type": "code", "text": "dC / dW_jk^(L)  =  (dC / da_j^(L))  *  (da_j^(L) / dz_j^(L))  *  (dz_j^(L) / dW_jk^(L))\n\nWhere:\n1. dC / da_j^(L) = -(y_j - a_j^(L))\n2. da_j^(L) / dz_j^(L) = f'(z_j^(L))\n3. dz_j^(L) / dW_jk^(L) = a_k^(L-1)\n\nTherefore:\ndC / dW_jk^(L) = delta_j^(L) * a_k^(L-1)   where delta_j^(L) = -(y_j - a_j^(L)) * f'(z_j^(L))"},
            
            {"type": "p", "text": "For hidden layers, the error delta is propagated back by summing the weighted errors of the downstream layers, which is mathematically elegant and easily computerized."},
            
            {"type": "h2", "text": "Python Implementation Example"},
            {"type": "p", "text": "Here is a simplified Python block to perform a single forward and backward pass for a single neuron using NumPy:"},
            {"type": "code", "text": "import numpy as np\n\ndef forward_pass(x, w, b):\n    z = np.dot(w, x) + b\n    a = 1.0 / (1.0 + np.exp(-z)) # Sigmoid activation\n    return z, a\n\ndef backward_pass(x, y, z, a, w):\n    # Loss derivative w.r.t output activation\n    dc_da = -(y - a)\n    # Sigmoid derivative w.r.t z\n    da_dz = a * (1.0 - a)\n    delta = dc_da * da_dz\n    # Gradient w.r.t weights and bias\n    dw = delta * x\n    db = delta\n    return dw, db"},
            
            {"type": "pagebreak"}, # Page 3
            
            {"type": "h1", "text": "4. Practical Challenges and Regularization"},
            {"type": "p", "text": "When neural networks grow in size, they become highly prone to **Overfitting**, where they memorize the training data rather than generalizing. To combat this, several techniques are applied:"},
            {"type": "bullet", "text": "<b>L2 Regularization (Weight Decay):</b> Adds a penalty proportional to the square of weights to the loss function, forcing weights to remain small. Loss_total = Loss_data + lambda * sum(W^2)."},
            {"type": "bullet", "text": "<b>Dropout:</b> Randomly deactivates a fraction of neurons (e.g., 30%) during each training iteration, preventing neurons from co-adapting and forcing redundant learning paths."},
            {"type": "bullet", "text": "<b>Batch Normalization:</b> Normalizes the inputs of each hidden layer to have zero mean and unit variance, speeding up training and acting as a mild regularizer."}
        ]

    # ─── 2. DISTRIBUTED SYSTEMS: RPC ───
    elif "rpc" in title.lower() or "procedure" in title.lower():
        return [
            {"type": "h1", "text": "Unit 2: Remote Procedure Call (RPC) Frameworks & Protocols"},
            {"type": "p", "text": "Remote Procedure Call (RPC) is a powerful paradigm in Distributed Systems that allows a computer program to cause a subroutine or procedure to execute in another address space (commonly on another computer on a shared network) without the programmer explicitly coding the details for this remote interaction."},
            
            {"type": "h2", "text": "1. Operational Architecture"},
            {"type": "p", "text": "The fundamental goal of RPC is to make remote calls look exactly like local function calls. This transparency is achieved through client and server 'stubs' which manage serialization and network transport parameters seamlessly."},
            
            {"type": "table", "headers": ["Step", "Client Node Action", "Server Node Action"],
             "col_widths": [50, 227, 227],
             "rows": [
                 ["1", "Client program calls the local client stub with normal arguments.", "Server is idle, waiting in a listening loop."],
                 ["2", "Client stub packs (marshals) arguments into a message payload.", "Network receives packet and forwards to Server OS."],
                 ["3", "Client OS sends the message to the remote server OS.", "Server OS hands the marshalled packet to Server Stub."],
                 ["4", "Client waits/blocks for the return result.", "Server stub unmarshals arguments, calls local service function."],
                 ["5", "Client OS receives results packet from network.", "Server stub marshals return values and sends back via OS."]
             ]},
            
            {"type": "pagebreak"},
            
            {"type": "h1", "text": "2. Marshalling and Unmarshalling"},
            {"type": "p", "text": "Marshalling refers to the process of translating memory representation of parameters into a standardized serialized format (e.g., JSON, XML, or Binary Protocol Buffers) suitable for network transmission. The reverse process on the receiving side is called Unmarshalling."},
            {"type": "p", "text": "A primary challenge is dealing with heterogeneous architectures (e.g., Big-Endian vs Little-Endian byte ordering, or varying floating-point formats). This is solved using an Interface Definition Language (IDL) to precompile data schemas."},
            
            {"type": "h2", "text": "3. Call Semantics Under Network Failures"},
            {"type": "p", "text": "Unlike local calls, remote calls can fail in complex ways (lost request, lost response, server crash, client crash). RPC systems define specific execution semantics to handle failures:"},
            {"type": "bullet", "text": "<b>At-Least-Once Semantics:</b> The client retransmits requests until an ACK is received. If the server executes twice, it must be idempotent (e.g., setting balance = 100)."},
            {"type": "bullet", "text": "<b>At-Most-Once Semantics:</b> Server filters duplicates using unique request transaction IDs. Ensures a transaction (e.g., deduct ₹50) occurs at most once."},
            {"type": "bullet", "text": "<b>Exactly-Once Semantics:</b> The holy grail of RPC. Extremely difficult to achieve, requiring two-phase commit protocols and persistent logging mechanisms."}
        ]

    # ─── 3. SOFTWARE ENGINEERING: AGILE VS WATERFALL ───
    elif "agile" in title.lower() or "waterfall" in title.lower():
        return [
            {"type": "h1", "text": "Unit 1: Software Process Models — Agile vs. Waterfall"},
            {"type": "p", "text": "Selecting the right Software Development Life Cycle (SDLC) model is critical to project success. The traditional, plan-driven Waterfall model represents a linear, sequential approach, whereas Agile methodologies champion incremental, iterative, and flexible development cycles."},
            
            {"type": "h2", "text": "1. The Waterfall Model"},
            {"type": "p", "text": "Waterfall treats software engineering like an assembly line. Each phase (Requirements, Design, Implementation, Verification, Maintenance) must be 100% complete and signed off before the next phase begins. There is very little room for backward revisions once coding starts."},
            
            {"type": "h2", "text": "2. Agile Scrum Framework"},
            {"type": "p", "text": "Scrum decomposes projects into fixed-length iterations called Sprints (usually 2-4 weeks). Each Sprint produces a potentially shippable increment of software. Change is welcomed and accommodated during regular backlog grooming sessions."},
            
            {"type": "pagebreak"},
            
            {"type": "h1", "text": "3. Head-to-Head Architectural Comparison"},
            {"type": "p", "text": "The table below highlights key operational differences between linear and iterative process methodologies:"},
            {"type": "table", "headers": ["Dimension", "Waterfall Model", "Agile Scrum Framework"],
             "col_widths": [110, 197, 197],
             "rows": [
                 ["Approach", "Linear, rigid, sequential stages.", "Iterative, incremental, feedback loops."],
                 ["Requirements", "Defined upfront, changes strictly controlled.", "Flexible, captured as User Stories in Backlog."],
                 ["Delivery", "Single major release at project conclusion.", "Continuous, shippable increments per Sprint."],
                 ["Risk", "High. Discovered late during testing phase.", "Low. Verified continuously via test automation."],
                 ["User Feedbacks", "Collected at beginning and end of cycle.", "Continuous review at the end of each Sprint."]
             ]},
            
            {"type": "h2", "text": "4. Deciding Which Model to Use"},
            {"type": "p", "text": "Use **Waterfall** if: requirements are crystal clear, technology is well understood and stable, and safety/security regulations demand heavy, rigid documentation upfront (e.g., flight control systems, medical equipment software)."},
            {"type": "p", "text": "Use **Agile** if: you are building a consumer-facing app, startup MVP, or a system where user feedback is expected to drive feature changes rapidly over time."}
        ]

    # ─── 4. DIGITAL IMAGE PROCESSING: SPATIAL FILTERS ───
    elif "spatial" in title.lower() or "filter" in title.lower() or "convolution" in title.lower():
        return [
            {"type": "h1", "text": "Unit 2: Image Enhancement — Spatial Filtering & Convolution"},
            {"type": "p", "text": "Spatial filtering is a fundamental technique in digital image processing, working directly on the pixels of an image. It is performed by convolving a small matrix, called a kernel or mask, across the 2D pixel array of the image."},
            
            {"type": "h2", "text": "1. Mathematical Theory of 2D Convolution"},
            {"type": "p", "text": "For an image pixel f(x,y) and a filter kernel w(s,t) of size mxn, the filtered pixel g(x,y) is defined as the sum of products of the kernel coefficients and the corresponding image pixels under the mask:"},
            
            {"type": "code", "text": "g(x,y) = sum_{s=-a}^{a} sum_{t=-b}^{b} w(s,t) * f(x+s, y+t)\n\nWhere:\n- a = (m - 1) / 2  and  b = (n - 1) / 2\n- m and n are odd dimensions of the kernel (e.g., 3x3, 5x5)\n- Boundary pixels are handled via zero-padding or boundary mirroring."},
            
            {"type": "pagebreak"},
            
            {"type": "h1", "text": "2. Linear Smoothing and Sharpening Filters"},
            {"type": "p", "text": "Filters can be classified based on their frequency characteristics into smoothing (low-pass) and sharpening (high-pass) filters."},
            
            {"type": "table", "headers": ["Filter Type", "Common Kernel Example", "Primary Application"],
             "col_widths": [100, 164, 240],
             "rows": [
                 ["Linear Box Filter", "1/9 * [[1,1,1],[1,1,1],[1,1,1]]", "Blurs noise, smooths textures, prep before edge detection."],
                 ["Gaussian Filter", "Bell curve weight coefficients", "More natural blurring without harsh square block artifacts."],
                 ["Laplacian Mask", "[[0,1,0],[1,-4,1],[0,1,0]]", "Sharpening. Highlights fine details, edges, and lines by subtraction."]
             ]},
            
            {"type": "h2", "text": "3. Python Convolution Implementation"},
            {"type": "p", "text": "Below is the algorithmic representation of convolving a 3x3 filter kernel on a grayscale image using NumPy loops:"},
            {"type": "code", "text": "import numpy as np\n\ndef convolve2d(image, kernel):\n    img_h, img_w = image.shape\n    k_h, k_w = kernel.shape\n    # Pad borders with zeros\n    padded = np.pad(image, ((1,1), (1,1)), mode='constant')\n    output = np.zeros_like(image)\n    \n    for y in range(img_h):\n        for x in range(img_w):\n            # Extract region of interest under mask\n            roi = padded[y:y+3, x:x+3]\n            # Element-wise multiply and sum\n            output[y, x] = np.sum(roi * kernel)\n    return np.clip(output, 0, 255).astype(np.uint8)"}
        ]

    # ─── FALLBACK GENERIC STUDY NOTES ───
    else:
        return [
            {"type": "h1", "text": f"Study Reference: {title}"},
            {"type": "p", "text": f"This document contains comprehensive syllabus study reference notes for the topic '{title}'. It contains structured academic guides, questions, and revision cheat sheets compiled by the Department of Computer Science & Engineering."},
            {"type": "h2", "text": "Key Learning Objectives"},
            {"type": "bullet", "text": "Understand core theoretical definitions and mathematical models."},
            {"type": "bullet", "text": "Gain hands-on pseudocode implementation details for computer-based labs."},
            {"type": "bullet", "text": "Solve unit question banks in preparation for the end-semester examinations."},
            {"type": "spacer", "text": ""},
            {"type": "p", "text": "Refer to college guidelines for additional digital library references and laboratory assignments."}
        ]
