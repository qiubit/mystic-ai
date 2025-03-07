import { togetherai } from "@ai-sdk/togetherai";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

function parseHtmlFilename(url) {
    // Create a URL object
    const urlObj = new URL(url);

    // Get the pathname from the URL
    const pathname = urlObj.pathname;

    // Extract just the filename part from the pathname
    const filenameWithExtension = pathname.split('/').pop();

    // Remove the .html extension
    const filename = filenameWithExtension.replace('.html', '');

    return filename;
  }

export async function POST(req) {
  try {
    const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
    if (!BLOB_READ_WRITE_TOKEN) {
      return Response.json(
        { error: "API key not configured on server" },
        { status: 500 }
      );
    }
    const body = await req.json();
    const { html } = body;
    const uuid = uuidv4();
    const { url } = await put(`readings/${uuid}.html`, html, {
      access: "public",
    });
    console.log(url);
    const filename = parseHtmlFilename(url);
    return NextResponse.json({ uuid: filename });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 400 });
  }
}
