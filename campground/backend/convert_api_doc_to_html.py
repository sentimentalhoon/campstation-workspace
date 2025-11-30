#!/usr/bin/env python3
"""
Convert API Documentation Markdown to HTML
"""

import markdown2
import os

# Read markdown file
with open('API-Endpoints-Documentation.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert to HTML with extras
html_body = markdown2.markdown(md_content, extras=['tables', 'fenced-code-blocks', 'header-ids', 'toc'])

# Create full HTML with CSS
html_content = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CampStation Backend API Documentation</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

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
            .toc {{
                page-break-after: always;
            }}
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Malgun Gothic', Arial, sans-serif;
            line-height: 1.8;
            color: #333;
            background: #f8f9fa;
            padding: 0;
            margin: 0;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
            min-height: 100vh;
        }}

        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 60px 40px;
            position: relative;
            overflow: hidden;
        }}

        .header::before {{
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 500px;
            height: 500px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
        }}

        .header h1 {{
            font-size: 2.8em;
            margin-bottom: 20px;
            font-weight: 700;
            position: relative;
            z-index: 1;
        }}

        .header-meta {{
            font-size: 1.1em;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }}

        .header-meta p {{
            margin: 5px 0;
        }}

        .content {{
            padding: 60px;
        }}

        .print-button {{
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(102,126,234,0.3);
            transition: all 0.3s ease;
            z-index: 1000;
        }}

        .print-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102,126,234,0.4);
        }}

        h1 {{
            color: #667eea;
            border-bottom: 4px solid #667eea;
            padding-bottom: 15px;
            margin-top: 50px;
            margin-bottom: 30px;
            font-size: 2.5em;
            font-weight: 700;
        }}

        h2 {{
            color: #764ba2;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
            margin-top: 40px;
            margin-bottom: 25px;
            font-size: 2em;
            font-weight: 600;
        }}

        h3 {{
            color: #5a67d8;
            margin-top: 35px;
            margin-bottom: 20px;
            font-size: 1.5em;
            font-weight: 600;
        }}

        h4 {{
            color: #667eea;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 1.2em;
            font-weight: 600;
        }}

        p {{
            margin: 15px 0;
            line-height: 1.8;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-size: 0.95em;
            border-radius: 8px;
            overflow: hidden;
        }}

        table th {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
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

        li ul, li ol {{
            margin-top: 8px;
        }}

        hr {{
            border: none;
            border-top: 3px solid #e2e8f0;
            margin: 40px 0;
        }}

        blockquote {{
            border-left: 5px solid #667eea;
            background: #eff6ff;
            padding: 15px 20px;
            margin: 20px 0;
            color: #1e40af;
            border-radius: 4px;
        }}

        strong {{
            color: #667eea;
            font-weight: 600;
        }}

        .toc {{
            background: #f8fafc;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border: 2px solid #e2e8f0;
        }}

        .toc h2 {{
            margin-top: 0;
            color: #667eea;
            border: none;
        }}

        .toc ul {{
            list-style-type: none;
            padding-left: 0;
        }}

        .toc li {{
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }}

        .toc li:last-child {{
            border-bottom: none;
        }}

        .toc a {{
            color: #5a67d8;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }}

        .toc a:hover {{
            color: #667eea;
        }}

        .endpoint {{
            background: #f8fafc;
            padding: 20px;
            border-left: 4px solid #667eea;
            margin: 15px 0;
            border-radius: 4px;
        }}

        .method {{
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.85em;
            margin-right: 10px;
        }}

        .method.get {{
            background: #10b981;
            color: white;
        }}

        .method.post {{
            background: #3b82f6;
            color: white;
        }}

        .method.put {{
            background: #f59e0b;
            color: white;
        }}

        .method.delete {{
            background: #ef4444;
            color: white;
        }}

        .method.patch {{
            background: #8b5cf6;
            color: white;
        }}

        .badge {{
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 600;
            margin-left: 10px;
        }}

        .badge.public {{
            background: #10b981;
            color: white;
        }}

        .badge.auth {{
            background: #f59e0b;
            color: white;
        }}

        .badge.owner {{
            background: #8b5cf6;
            color: white;
        }}

        .badge.admin {{
            background: #ef4444;
            color: white;
        }}

        .footer {{
            margin-top: 60px;
            padding: 30px 60px;
            background: #f8fafc;
            text-align: center;
            color: #64748b;
            font-size: 0.9em;
            border-top: 2px solid #e2e8f0;
        }}

        a {{
            color: #667eea;
            text-decoration: none;
        }}

        a:hover {{
            text-decoration: underline;
        }}
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">📄 PDF로 저장</button>

    <div class="container">
        <div class="header">
            <h1>🏕️ CampStation Backend API</h1>
            <div class="header-meta">
                <p><strong>작성일:</strong> 2025-11-16</p>
                <p><strong>API 버전:</strong> v1</p>
                <p><strong>Base URL:</strong> http://localhost:8080/api/v1</p>
            </div>
        </div>

        <div class="content">
            {html_body}
        </div>

        <div class="footer">
            <p>📊 CampStation Backend API Documentation</p>
            <p>Generated by Claude AI Assistant | © 2025</p>
            <p>Total Controllers: 17 | Total Endpoints: 100+</p>
        </div>
    </div>

    <script>
        // Enhance endpoint display
        document.querySelectorAll('li').forEach(item => {{
            const text = item.innerHTML;

            // Highlight HTTP methods
            const methodRegex = /(GET|POST|PUT|DELETE|PATCH) (\/api\/v1\/[^<\\s]+)/g;
            if (methodRegex.test(text)) {{
                const enhanced = text.replace(methodRegex, (match, method, path) => {{
                    const methodClass = method.toLowerCase();
                    return `<span class="method ${{methodClass}}">${{method}}</span><code>${{path}}</code>`;
                }});
                item.innerHTML = enhanced;
            }}

            // Highlight permission badges
            const permRegex = /권한: (Public|Authenticated|OWNER|ADMIN|OWNER or ADMIN)/g;
            if (permRegex.test(text)) {{
                const enhanced = text.replace(permRegex, (match, perm) => {{
                    let badgeClass = 'public';
                    if (perm === 'Authenticated') badgeClass = 'auth';
                    else if (perm === 'OWNER' || perm === 'OWNER or ADMIN') badgeClass = 'owner';
                    else if (perm === 'ADMIN') badgeClass = 'admin';
                    return `권한: <span class="badge ${{badgeClass}}">${{perm}}</span>`;
                }});
                item.innerHTML = enhanced;
            }}
        }});

        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {{
            anchor.addEventListener('click', function (e) {{
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {{
                    target.scrollIntoView({{
                        behavior: 'smooth',
                        block: 'start'
                    }});
                }}
            }});
        }});
    </script>
</body>
</html>"""

# Save HTML file
output_file = 'API-Endpoints-Documentation.html'
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
