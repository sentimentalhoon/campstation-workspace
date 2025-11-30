#!/usr/bin/env python3
"""
Convert Markdown to HTML with print-friendly CSS
"""

import markdown2
import os

# Read markdown file
with open('CampStation-Backend-Report.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert to HTML with extras
html_body = markdown2.markdown(md_content, extras=['tables', 'fenced-code-blocks', 'header-ids'])

# Create full HTML with CSS
html_content = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CampStation Backend Project Report</title>
    <style>
        @media print {{
            @page {{
                size: A4;
                margin: 2cm;
            }}
            body {{
                font-size: 11pt;
            }}
            h1 {{
                page-break-before: always;
            }}
            h1:first-of-type {{
                page-break-before: avoid;
            }}
            table, pre, blockquote {{
                page-break-inside: avoid;
            }}
            .no-print {{
                display: none;
            }}
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Malgun Gothic', Arial, sans-serif;
            line-height: 1.8;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f8f9fa;
        }}

        .container {{
            background: white;
            padding: 60px;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
            border-radius: 8px;
        }}

        h1 {{
            color: #2563eb;
            border-bottom: 4px solid #2563eb;
            padding-bottom: 15px;
            margin-top: 40px;
            margin-bottom: 30px;
            font-size: 2.5em;
            font-weight: 700;
        }}

        h2 {{
            color: #1e40af;
            border-bottom: 2px solid #93c5fd;
            padding-bottom: 10px;
            margin-top: 35px;
            margin-bottom: 20px;
            font-size: 1.8em;
            font-weight: 600;
        }}

        h3 {{
            color: #1e3a8a;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 1.4em;
            font-weight: 600;
        }}

        h4 {{
            color: #1e40af;
            margin-top: 25px;
            margin-bottom: 12px;
            font-size: 1.2em;
            font-weight: 600;
        }}

        p {{
            margin: 15px 0;
            text-align: justify;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-size: 0.95em;
        }}

        table th {{
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #1e40af;
        }}

        table td {{
            border: 1px solid #e5e7eb;
            padding: 12px 15px;
        }}

        table tr:nth-child(even) {{
            background-color: #f8fafc;
        }}

        table tr:hover {{
            background-color: #eff6ff;
        }}

        code {{
            background-color: #f1f5f9;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
            color: #dc2626;
            border: 1px solid #e2e8f0;
        }}

        pre {{
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 1px solid #334155;
        }}

        pre code {{
            background: transparent;
            color: #e2e8f0;
            padding: 0;
            border: none;
            font-size: 0.9em;
        }}

        ul, ol {{
            margin: 15px 0;
            padding-left: 30px;
        }}

        li {{
            margin: 8px 0;
            line-height: 1.8;
        }}

        hr {{
            border: none;
            border-top: 3px solid #e2e8f0;
            margin: 40px 0;
        }}

        blockquote {{
            border-left: 5px solid #2563eb;
            background: #eff6ff;
            padding: 15px 20px;
            margin: 20px 0;
            color: #1e40af;
            font-style: italic;
            border-radius: 4px;
        }}

        strong {{
            color: #1e40af;
            font-weight: 600;
        }}

        .print-button {{
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(37,99,235,0.3);
            transition: all 0.3s ease;
            z-index: 1000;
        }}

        .print-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(37,99,235,0.4);
        }}

        .header-info {{
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 40px;
            border-left: 5px solid #2563eb;
        }}

        .header-info h1 {{
            margin-top: 0;
            border: none;
            padding: 0;
        }}

        .toc {{
            background: #f8fafc;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            border: 2px solid #e2e8f0;
        }}

        .toc h2 {{
            margin-top: 0;
            color: #1e40af;
            border: none;
        }}

        .footer {{
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">📄 PDF로 저장</button>

    <div class="container">
        <div class="header-info">
            <h1>🏕️ CampStation Backend Project Report</h1>
            <p><strong>생성일:</strong> 2025-11-16</p>
            <p><strong>프로젝트:</strong> CampStation Backend API Server</p>
            <p><strong>버전:</strong> 0.0.1-SNAPSHOT</p>
        </div>

        {html_body}

        <div class="footer">
            <p>📊 CampStation Backend Project Analysis Report</p>
            <p>Generated by Claude AI Assistant | © 2025</p>
        </div>
    </div>

    <script>
        // Enhance tables
        document.querySelectorAll('table').forEach(table => {{
            table.style.fontSize = '0.9em';
        }});

        // Add line numbers to code blocks
        document.querySelectorAll('pre code').forEach((block, index) => {{
            const lines = block.textContent.split('\\n');
            if (lines.length > 1) {{
                block.innerHTML = lines.map((line, i) =>
                    `<span style="color:#64748b;user-select:none;margin-right:15px;">${{(i+1).toString().padStart(2, '0')}}</span>${{line}}`
                ).join('\\n');
            }}
        }});
    </script>
</body>
</html>"""

# Save HTML file
output_file = 'CampStation-Backend-Report.html'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"✅ HTML file created successfully: {output_file}")
file_size = os.path.getsize(output_file) / 1024
print(f"📄 File size: {file_size:.2f} KB")
print(f"📍 Location: {os.path.abspath(output_file)}")
print("")
print("🖨️  다음 단계:")
print("1. 브라우저에서 HTML 파일을 엽니다")
print("2. '📄 PDF로 저장' 버튼을 클릭하거나 Ctrl+P를 누릅니다")
print("3. '대상'을 'PDF로 저장'으로 선택합니다")
print("4. 저장 버튼을 클릭합니다")
