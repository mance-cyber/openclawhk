"""Generate AI Agent Quick Start Checklist PDF"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

OUTPUT = "C:/Users/ktphi/clawd/temp/openclawhk-repo/downloads/ai-agent-checklist-free.pdf"

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=20*mm, leftMargin=20*mm,
    topMargin=16*mm, bottomMargin=16*mm
)

W, H = A4
styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle('Title', parent=styles['Normal'],
    fontSize=22, fontName='Helvetica-Bold', textColor=colors.HexColor('#1e3a5f'),
    spaceAfter=4, alignment=TA_CENTER)

subtitle_style = ParagraphStyle('Sub', parent=styles['Normal'],
    fontSize=11, fontName='Helvetica', textColor=colors.HexColor('#4a6fa5'),
    spaceAfter=6, alignment=TA_CENTER)

badge_style = ParagraphStyle('Badge', parent=styles['Normal'],
    fontSize=9, fontName='Helvetica-BoldOblique', textColor=colors.HexColor('#d97706'),
    spaceAfter=10, alignment=TA_CENTER)

step_title_style = ParagraphStyle('StepTitle', parent=styles['Normal'],
    fontSize=13, fontName='Helvetica-Bold', textColor=colors.HexColor('#1e3a5f'),
    spaceAfter=3, spaceBefore=8)

step_body_style = ParagraphStyle('StepBody', parent=styles['Normal'],
    fontSize=10, fontName='Helvetica', textColor=colors.HexColor('#374151'),
    spaceAfter=2, leading=15)

tip_style = ParagraphStyle('Tip', parent=styles['Normal'],
    fontSize=9, fontName='Helvetica-Oblique', textColor=colors.HexColor('#6b7280'),
    spaceAfter=4, leftIndent=8)

footer_style = ParagraphStyle('Footer', parent=styles['Normal'],
    fontSize=8, fontName='Helvetica', textColor=colors.HexColor('#9ca3af'),
    alignment=TA_CENTER, spaceBefore=10)

story = []

# Header
story.append(Spacer(1, 4*mm))
story.append(Paragraph("AI Agent Quick Start Checklist", title_style))
story.append(Paragraph("5 Steps to Launch Your First AI Agent in HK", subtitle_style))
story.append(Paragraph("Free Resource by openclawhk.io  |  2026 Edition", badge_style))

# Divider
divider_data = [['']]
divider = Table(divider_data, colWidths=[170*mm])
divider.setStyle(TableStyle([
    ('LINEABOVE', (0,0), (-1,0), 2, colors.HexColor('#3b82f6')),
    ('TOPPADDING', (0,0), (-1,-1), 0),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
]))
story.append(divider)
story.append(Spacer(1, 3*mm))

# Steps
steps = [
    {
        "num": "1",
        "emoji": "Install OpenClaw",
        "title": "Step 1: Install OpenClaw",
        "items": [
            "[ ]  Install Node.js (v18+) from nodejs.org",
            "[ ]  Run: npx openclaw@latest init",
            "[ ]  Choose your AI provider (Claude / GPT-4 recommended)",
            "[ ]  Set your API key in .env file",
        ],
        "tip": "Tip: Use Claude Sonnet for best Chinese language support"
    },
    {
        "num": "2",
        "title": "Step 2: Set Up Your First Agent",
        "items": [
            "[ ]  Create AGENTS.md in your project folder",
            "[ ]  Define agent role, goals, and tone in AGENTS.md",
            "[ ]  Add SOUL.md for personality (optional but recommended)",
            "[ ]  Test with: npx openclaw chat",
        ],
        "tip": "Tip: Write AGENTS.md in Traditional Chinese for best HK results"
    },
    {
        "num": "3",
        "title": "Step 3: Connect a Channel",
        "items": [
            "[ ]  Choose: Telegram / WhatsApp / Discord / CLI",
            "[ ]  For Telegram: create bot via @BotFather, get token",
            "[ ]  Add TELEGRAM_BOT_TOKEN to your .env",
            "[ ]  Test your bot responds in Telegram",
        ],
        "tip": "Tip: Telegram is the easiest channel to start with in HK"
    },
    {
        "num": "4",
        "title": "Step 4: Add Your First Skill",
        "items": [
            "[ ]  Browse skills at clawhub.com",
            "[ ]  Install: npx openclaw skill add <skill-name>",
            "[ ]  Configure skill settings in skills/ folder",
            "[ ]  Test the skill in your chat channel",
        ],
        "tip": "Tip: Start with a content skill or customer-service skill"
    },
    {
        "num": "5",
        "title": "Step 5: Enable Autonomous Mode (Heartbeat)",
        "items": [
            "[ ]  Create a heartbeat schedule in your agent config",
            "[ ]  Define recurring tasks (e.g. daily report, lead follow-up)",
            "[ ]  Set memory system so agent remembers context",
            "[ ]  Monitor first 3 autonomous runs carefully",
        ],
        "tip": "Tip: Start with hourly heartbeats, scale to continuous later"
    },
]

for step in steps:
    story.append(Paragraph(step["title"], step_title_style))
    for item in step["items"]:
        story.append(Paragraph(item, step_body_style))
    story.append(Paragraph(step["tip"], tip_style))

story.append(Spacer(1, 4*mm))

# Bottom CTA box
cta_data = [["Ready to go deeper? Get the full OpenClaw Setup Guide at openclawhk.io — US$29"]]
cta_table = Table(cta_data, colWidths=[170*mm])
cta_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#eff6ff')),
    ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#1e3a5f')),
    ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 10),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#3b82f6')),
    ('TOPPADDING', (0,0), (-1,-1), 10),
    ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ('ROUNDEDCORNERS', [6]),
]))
story.append(cta_table)

story.append(Paragraph("openclawhk.io  |  manceli@m-pro.com.hk  |  (c) 2026 Mercury Production Limited", footer_style))

doc.build(story)
print(f"PDF created: {OUTPUT}")
