from openai import OpenAI
from flask import current_app
from app.models.schemas import Municipio
from app.services.pdf_service import extract_text_from_pdf


def extract_data_from_pdf():
    """Extrair e estruturar dados do PDF usando OpenAI."""
    # Obter texto do PDF
    prompt = extract_text_from_pdf()

    # Configurar cliente OpenAI
    client = OpenAI(api_key=current_app.config['OPENAI_API_KEY'])

    # Enviar solicitação para a OpenAI
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini-2024-07-18",
        messages=[
            {"role": "system",
             "content": "Você é um consultor de prefeituras, você vai extrair qual é o municipio assim como o numero do convênio ou do contrato apresentado, juntamente com o objeto e os dados. os dados são Valor do Repasse, Valor da Contrapartida, Percentual de Recurso Repassado pelo Ministério, Valor Desbloqueado à Empresa, Percentual de Execução da Obra, Vigência do Convênio, Dados Bancários, Vigência LAC nº, Processo Licitatório, Empresa Executora, Valor do Contrato com a Empresa, Vigência do Contrato com a Empresa, Prazo para Pagamento à Empresa, o municipio de lucena tem 30 convênios, lembre-se que os convenios podem vir tanto com o nome de contrato de repasse quanto como convênio, termo de compromisso, id, emenda"},
            {"role": "user", "content": prompt}
        ],
        response_format=Municipio(),
    )

    # Extrair o modelo Municipio da resposta
    municipio_data = completion.choices[0].message.parsed

    return municipio_data