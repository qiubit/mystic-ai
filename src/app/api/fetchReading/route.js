import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get("uuid");

    if (!uuid) {
      return NextResponse.json(
        { error: "UUID parameter is required" },
        { status: 400 }
      );
    }

    // Create the URL to your Vercel Blob storage
    const blobUrl = `https://p57rgqdwhcfjmnry.public.blob.vercel-storage.com/readings/${uuid}.html`;

    // Fetch HTML directly from the blob storage
    const response = await fetch(blobUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Reading not found" },
        { status: response.status }
      );
    }

    const html = await response.text();
    return NextResponse.json({ html });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
