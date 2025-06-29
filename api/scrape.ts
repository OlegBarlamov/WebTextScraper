import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import https from 'https';
import http from 'http';

const turndown = new TurndownService();

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const targetUrl = req.query.url as string;
  if (!targetUrl) return res.status(400).json({ error: "Missing URL" });

  try {
    new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const client = targetUrl.startsWith("https") ? https : http;
  const request = client.get(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    }
  }, response => {
    const chunks: Buffer[] = [];

    response.on("data", chunk => chunks.push(chunk));
    response.on("end", () => {
      const html = Buffer.concat(chunks).toString("utf8");
      const $ = cheerio.load(html);
      $("script, style, iframe, nav, header, footer").remove();

      let content = $("article").html() || $("main").html() || $("body").html() || "";
      const markdown = turndown.turndown(content);

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).send(markdown);
    });
  });

  request.on("error", err => {
    res.status(500).json({ error: "Fetch failed", message: err.message });
  });
}
