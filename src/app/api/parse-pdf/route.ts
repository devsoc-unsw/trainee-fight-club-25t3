import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.PDF_CO_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing PDF.co API Key" },
      { status: 500 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("pdfFile") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // convert file to blob to upload
    const fileBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileBuffer], { type: "application/pdf" });

    // get presigned url from pdf.co
    const uploadRes = await fetch(
      "https://api.pdf.co/v1/file/upload/get-presigned-url?name=statement.pdf",
      {
        headers: { "x-api-key": apiKey },
      },
    );
    const uploadData = await uploadRes.json();

    if (uploadData.error) {
      throw new Error(uploadData.message);
    }

    const { presignedUrl, url: accessUrl } = uploadData;

    // upload user's file to presigned url
    const uploadFileRes = await fetch(presignedUrl, {
      method: "PUT",
      body: fileBlob,
      headers: { "Content-Type": "application/pdf" },
    });

    if (!uploadFileRes.ok) {
      throw new Error("Failed to upload file to PDF.co");
    }

    // make api call to extract text from pdf
    const extractRes = await fetch(
      "https://api.pdf.co/v1/pdf/convert/to/text",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          url: accessUrl,
          inline: true, // return text in json
          async: false, // Wait for the result
        }),
      },
    );

    const extractData = await extractRes.json();

    if (extractData.error) {
      throw new Error(extractData.message);
    }

    return NextResponse.json({
      text: extractData.body,
    });
  } catch (error) {
    console.error("PDF.co Error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 },
    );
  }
}
