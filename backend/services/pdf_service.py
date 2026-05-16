from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io
from datetime import datetime

async def generate_student_report(student_data: dict, attendance_logs: list):
    """
    Generates a beautiful PDF report for a student.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    normal_style = styles['Normal']

    # Header
    elements.append(Paragraph(f"Attendance Report: {student_data['name']}", title_style))
    elements.append(Paragraph(f"USN: {student_data['usn']} | Branch: {student_data['branch']}", normal_style))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", normal_style))
    elements.append(Spacer(1, 20))

    # Stats
    total = len(attendance_logs)
    present = len([l for l in attendance_logs if l['status'] == 'PRESENT'])
    pct = (present / total * 100) if total > 0 else 0
    
    elements.append(Paragraph(f"Overall Attendance: {round(pct, 2)}%", styles['Heading2']))
    elements.append(Spacer(1, 10))

    # Table
    data = [["Date", "Subject", "Status", "Time"]]
    for log in attendance_logs:
        data.append([
            log.get('date', ''),
            log.get('subject', ''),
            log.get('status', ''),
            log.get('entryTimestamp', '').strftime('%H:%M') if hasattr(log.get('entryTimestamp'), 'strftime') else ''
        ])

    t = Table(data, colWidths=[100, 150, 100, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(t)
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
