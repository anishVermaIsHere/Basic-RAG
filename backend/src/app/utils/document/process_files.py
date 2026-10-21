from pathlib import Path
from pypdf import PdfReader


ALLOWED_FILE_EXTS = { ".pdf", ".docx", ".txt", ".md" }

def process_file(file_ext: str, file: Path):
    doc_texts = []

    if file_ext == ".pdf":
        reader = PdfReader(file)
        for i, page in enumerate(reader.pages):
            text = (page.extract_text() or '').strip()
            if text:
                doc_texts.append({ "text": text, "page": i+1, "source": file })
    
    # will be implement later

    # elif file_ext == ".docx":
    #     import docx
    #     doc = docx.Document(file)
    #     text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    #     doc_texts.append({ "text": text, "page": None, "source": file })

    elif file_ext in {".md", ".txt"}:
        text = file.read_text(encoding="utf-8")
        doc_texts.append({ "text": text, "page": None, "source": file })
    
    return doc_texts