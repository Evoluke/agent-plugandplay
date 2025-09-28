import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun } from "docx";
import slugify from "slugify";
import { getResumeById, getUserPlan, registerExport } from "@/lib/resumeStorage.server";
import { isPremiumPlan, type ResumePayload } from "@/lib/resume";

function buildTextLines(resume: ResumePayload) {
  const lines: string[] = [];
  lines.push(resume.fullName);
  if (resume.headline) lines.push(resume.headline);
  if (resume.summary) lines.push("Resumo: " + resume.summary);
  resume.experiences.forEach((experience) => {
    lines.push(`${experience.role} - ${experience.company}`);
    experience.achievements.forEach((achievement) => lines.push(`• ${achievement}`));
  });
  if (resume.skills.length) {
    lines.push("Skills: " + resume.skills.join(", "));
  }
  if (resume.languages.length) {
    lines.push("Idiomas: " + resume.languages.join(", "));
  }
  return lines;
}

async function createPdf(resume: ResumePayload, premium: boolean) {
  const document = await PDFDocument.create();
  const page = document.addPage();
  const { width, height } = page.getSize();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const lines = buildTextLines(resume);

  let y = height - 50;
  lines.forEach((line) => {
    page.drawText(line.slice(0, 120), {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 18;
  });

  if (!premium) {
    page.drawText("Gerado com Currículo IA Pro", {
      x: width / 2 - 100,
      y: 40,
      size: 10,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  return await document.save();
}

async function createDocx(resume: ResumePayload) {
  const paragraphs: Paragraph[] = [];
  paragraphs.push(new Paragraph({
    children: [new TextRun({ text: resume.fullName, bold: true, size: 32 })],
  }));
  if (resume.headline) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: resume.headline, italics: true, size: 24 })],
    }));
  }
  if (resume.summary) {
    paragraphs.push(new Paragraph(resume.summary));
  }
  resume.experiences.forEach((experience) => {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 200 },
        children: [
          new TextRun({ text: `${experience.role} - ${experience.company}`, bold: true }),
        ],
      }),
    );
    experience.achievements.forEach((achievement) => {
      paragraphs.push(
        new Paragraph({ text: `• ${achievement}`, bullet: { level: 0 } }),
      );
    });
  });
  if (resume.skills.length) {
    paragraphs.push(new Paragraph({
      spacing: { before: 200 },
      children: [
        new TextRun({ text: "Skills", bold: true }),
        new TextRun({ text: `: ${resume.skills.join(", ")}` }),
      ],
    }));
  }
  if (resume.languages.length) {
    paragraphs.push(new Paragraph({
      spacing: { before: 200 },
      children: [
        new TextRun({ text: "Idiomas", bold: true }),
        new TextRun({ text: `: ${resume.languages.join(", ")}` }),
      ],
    }));
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });
  return await Packer.toBuffer(doc);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const resumeId = url.searchParams.get("resumeId");
  const format = url.searchParams.get("format") ?? "pdf";

  if (!resumeId) {
    return NextResponse.json({ message: "resumeId é obrigatório" }, { status: 400 });
  }

  const resume = await getResumeById(resumeId);
  if (!resume) {
    return NextResponse.json({ message: "Currículo não encontrado" }, { status: 404 });
  }

  const plan = await getUserPlan(resume.userId ?? null);
  const premium = isPremiumPlan(plan);

  await registerExport(resume.id, format, resume.userId ?? null);

  if (format === "docx" && !premium) {
    return NextResponse.json({ message: "DOCX disponível apenas no plano premium" }, { status: 402 });
  }

  const safeName = slugify(resume.fullName || "curriculo", { lower: true, strict: true }) || "curriculo";

  if (format === "docx") {
    const buffer = await createDocx(resume);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${safeName}.docx"`,
      },
    });
  }

  const pdfBytes = await createPdf(resume, premium);
  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
    },
  });
}
