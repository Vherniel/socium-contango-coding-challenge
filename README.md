# Socium Contago Coding Challenge

**Submitted by:** Vherniel Lebis (Applicant)

## Overview

This is a small full-stack application that allows users to upload their CV/resume in PDF format through a web form. The form collects personal information such as:

* Full name
* Email address
* Phone number
* Skills (comma-separated)
* Work experience

Upon submission:

1. The PDF is read on the frontend and converted to a Base64 string.
2. This data is sent via a tRPC mutation to the backend.
3. The backend extracts raw text from the PDF and compares it with the submitted input.
4. The results are returned and displayed as match/mismatch indicators next to each form field.

### Architecture Diagram

![Architecture Diagram](https://raw.githubusercontent.com/Vherniel/socium-contago-coding-challenge/main/architecture.png)

---

## How to Run the Application

```bash
docker compose build && docker compose up
```

* Web app: [http://localhost:3000](http://localhost:3000)
* n8n workflow editor: [http://localhost:5678](http://localhost:5678)

### Setting up the workflow

1. Open the n8n editor at `http://localhost:5678/workflow/new`
2. Click the `…` (three dots) menu in the top-right, then **Import from File…**
3. Locate and import the file: `apps/web/cv-submit.json`
4. Connect each node in the workflow
5. Toggle the **Active** switch in the top-right to enable the workflow

Once that’s done, go to [http://localhost:3000](http://localhost:3000), fill in the form, and submit your PDF.
You’ll receive visual feedback indicating which fields were matched in the document and which weren’t.

---

## Possible Challenges and Considerations

* **PDF text extraction can be inconsistent** depending on layout, font encoding, or if the document is a scanned image (OCR not implemented).
* **String matching** is case-insensitive but still prone to edge cases like spacing, punctuation, or formatting differences that may cause false negatives.
* **Skill matching** uses literal keyword checks from comma-separated input. It won’t catch semantically similar skills or reformatted ones.
* **Security**: Base64-encoded PDFs are transmitted via network. In a production setting, a secure file upload system with virus scanning, file type validation, and size limits is essential.
* **Scalability**: Base64 transmission and in-memory PDF parsing work well for small files, but are not optimal for large-scale or concurrent usage.

---

## Development Notes & Challenges

While the original instruction mentioned using a database, it was not explicitly tied to any requirement or feature. After evaluating the application's flow, I found no need to persist any data:

* Form data is submitted and processed immediately.
* The PDF is parsed and compared in real time.
* No user or session state is stored.

Given the stateless nature of the task, a database was not necessary for this implementation.
However, should future requirements involve tracking submissions, logging results, or supporting user accounts, integrating a database like PostgreSQL or SQLite would be a straightforward extension.

Lastly, due to workspace constraints during the challenge, I was working in a Windows-based environment instead of my usual Linux setup. This introduced some minor friction with tooling (e.g., Docker volume paths and shell scripting), but I was able to adapt and ensure everything worked.
