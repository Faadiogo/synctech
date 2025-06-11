import json
import subprocess
from docxtpl import DocxTemplate
from pathlib import Path

# Caminhos
context_path = "context.json"
template_path = "template_contrato.docx"
output_docx = "Contrato_Fulanos_Site_Teste.docx"
output_pdf = "Contrato_Fulanos_Site_Teste.pdf"

# Carregar contexto
with open(context_path, "r", encoding="utf-8") as f:
    context = json.load(f)

# Gerar o DOCX com o template
doc = DocxTemplate(template_path)
doc.render(context)
doc.save(output_docx)
print(f"Contrato gerado: {output_docx}")

# Gerar PDF usando LibreOffice
try:
    libreoffice_path = r"C:\Program Files\LibreOffice\program\soffice.exe"
    subprocess.run([
        libreoffice_path,
        "--headless",
        "--convert-to", "pdf",
        "--outdir", ".",
        output_docx
    ], check=True)
    print(f"PDF gerado com sucesso: {output_pdf}")
except Exception as e:
    print("Erro ao gerar o PDF com LibreOffice:", e)
