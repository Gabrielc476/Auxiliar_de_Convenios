from pypdf import PdfReader


def extract_text_from_pdf(pdf_file):
    """Extrair texto de um arquivo PDF."""
    try:
        # Ler PDF diretamente do arquivo
        relatorio = PdfReader(pdf_file)
        relatorio_texto = ""

        # Extrair texto de cada página
        for pagina in relatorio.pages:
            try:
                texto_pagina = pagina.extract_text()
                if texto_pagina:
                    relatorio_texto += texto_pagina + "\n"
            except Exception as e:
                print(f"Erro ao processar página: {e}")
                continue

        if not relatorio_texto or len(relatorio_texto) < 100:
            print("Aviso: Pouco texto extraído do PDF!")

        return relatorio_texto
    except Exception as e:
        print(f"Erro ao extrair texto do PDF: {str(e)}")
        return ""