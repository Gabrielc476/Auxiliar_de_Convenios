from pypdf import PdfReader


def extract_text_from_pdf(pdf_path='Lucena.pdf'):
    """Extrair texto de um arquivo PDF."""
    try:
        relatorio = PdfReader(pdf_path)
        relatorio_texto = ""

        for pagina in relatorio.pages:
            relatorio_texto += pagina.extract_text()

        return relatorio_texto
    except Exception as e:
        print(f"Erro ao extrair texto do PDF: {str(e)}")
        return ""