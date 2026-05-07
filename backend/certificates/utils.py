from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from django.conf import settings
import os
import platform

def register_fonts():
    """Registers fonts for ReportLab, prioritizing Cyrillic support."""
    try:
        if platform.system() == 'Windows':
            # Windows usually has Arial
            font_path = "C:\\Windows\\Fonts\\arial.ttf"
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont('CyrillicFont', font_path))
                pdfmetrics.registerFont(TTFont('CyrillicFont-Bold', "C:\\Windows\\Fonts\\arialbd.ttf"))
                return 'CyrillicFont'
        else:
            # Linux / Docker
            # Try DejaVuSans which supports Cyrillic and is in fonts-dejavu
            possible_paths = [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "/usr/share/fonts/TTF/DejaVuSans.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    pdfmetrics.registerFont(TTFont('CyrillicFont', path))
                    # Try to find bold version
                    bold_path = path.replace('.ttf', '-Bold.ttf').replace('-Regular.ttf', '-Bold.ttf')
                    if os.path.exists(bold_path):
                        pdfmetrics.registerFont(TTFont('CyrillicFont-Bold', bold_path))
                    else:
                        pdfmetrics.registerFont(TTFont('CyrillicFont-Bold', path)) # Fallback
                    return 'CyrillicFont'
                    
    except Exception as e:
        print(f"Font registration warning: {e}")
        
    return 'Helvetica' # Fallback to standard (no Cyrillic support)

def generate_certificate_pdf(certificate):
    """
    Generates a PDF certificate for the given certificate object.
    Saves it to the media directory and returns the relative path.
    """
    filename = f"certificate_{certificate.user.username}_{certificate.course.id}_{certificate.id}.pdf"
    directory = os.path.join(settings.MEDIA_ROOT, 'certificates')
    
    if not os.path.exists(directory):
        os.makedirs(directory)
        
    filepath = os.path.join(directory, filename)
    
    # Register font
    font_name = register_fonts()
    bold_font_name = f"{font_name}-Bold" if font_name != 'Helvetica' else 'Helvetica-Bold'
    
    # Create the PDF object
    c = canvas.Canvas(filepath, pagesize=landscape(letter))
    width, height = landscape(letter)
    
    # Design Elements
    # Border
    c.setStrokeColorRGB(0.36, 0.68, 0.18) # #5cad2d (Primary Brand Color)
    c.setLineWidth(5)
    c.rect(0.5*inch, 0.5*inch, 10*inch, 7.5*inch)
    
    # Inner thin border
    c.setStrokeColorRGB(0.8, 0.8, 0.8)
    c.setLineWidth(1)
    c.rect(0.7*inch, 0.7*inch, 9.6*inch, 7.1*inch)
    
    # Header Area
    c.setFont(bold_font_name, 36)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    c.drawCentredString(width/2, height - 2*inch, "СЕРТИФИКАТ / СЕРТИФИКАТ")
    
    c.setFont(font_name, 14)
    c.setFillColorRGB(0.4, 0.4, 0.4)
    c.drawCentredString(width/2, height - 2.5*inch, "ЗА УСПЕШНОЕ ЗАВЕРШЕНИЕ КУРСА / КУРСТЫ СӘТТІ АЯҚТАҒАНЫ ҮШІН")
    
    # Recipient
    c.setFont(font_name, 16)
    c.setFillColorRGB(0.3, 0.3, 0.3)
    c.drawCentredString(width/2, height - 3.5*inch, "Настоящим подтверждается, что / Осымен расталады:")
    
    c.setFont(bold_font_name, 30)
    c.setFillColorRGB(0.36, 0.68, 0.18) # Primary Color
    
    # Use custom recipient name if available, otherwise user's full name, otherwise username
    if certificate.recipient_name:
        name_to_display = certificate.recipient_name
    elif certificate.user.first_name:
        name_to_display = f"{certificate.user.first_name} {certificate.user.last_name}"
    else:
        name_to_display = certificate.user.username
        
    c.drawCentredString(width/2, height - 4.25*inch, name_to_display)
    
    c.setLineWidth(1)
    c.line(width/2 - 3*inch, height - 4.4*inch, width/2 + 3*inch, height - 4.4*inch)
    
    # Course Content
    c.setFont(font_name, 16)
    c.setFillColorRGB(0.3, 0.3, 0.3)
    c.drawCentredString(width/2, height - 5.25*inch, "Успешно прошел(ла) курс / Курсты сәтті өтті")
    
    c.setFont(bold_font_name, 22)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    c.drawCentredString(width/2, height - 6*inch, certificate.course.title)
    
    # Footer (Date & ID)
    c.setFont(font_name, 12)
    c.setFillColorRGB(0.5, 0.5, 0.5)
    date_str = certificate.issued_at.strftime('%Y-%m-%d')
    c.drawString(1*inch, 1.5*inch, f"Date / Дата: {date_str}")
    c.drawRightString(width - 1*inch, 1.5*inch, f"ID: {certificate.id}")

    # Close the PDF object
    c.showPage()
    c.save()
    
    return f"certificates/{filename}"
