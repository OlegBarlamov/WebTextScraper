import type { Express } from "express";
import { createServer, type Server } from "http";
import https from "https";
import http from "http";
import { storage } from "./storage";
import * as cheerio from "cheerio";
import TurndownService from "turndown";

const turndown = new TurndownService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Add CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Web scraping endpoint
  app.get("/api/scrape", (req, res) => {
    const targetUrl = req.query.url as string;
    
    if (!targetUrl) {
      return res.status(400).json({ 
        error: "Missing URL parameter", 
        message: "Please provide a 'url' query parameter" 
      });
    }

    // Validate URL format
    try {
      new URL(targetUrl);
    } catch (error) {
      return res.status(400).json({
        error: "Invalid URL",
        message: "Please provide a valid URL starting with http:// or https://"
      });
    }

    const client = targetUrl.startsWith("https") ? https : http;
    const requestOptions = {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" 
      },
      timeout: 30000 // 30 second timeout
    };

    const request = client.get(targetUrl, requestOptions, (response) => {
      // Handle redirects
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return res.status(400).json({
          error: "Redirect detected",
          message: "Please use the final URL after redirects"
        });
      }

      if (response.statusCode && response.statusCode !== 200) {
        return res.status(response.statusCode).json({
          error: `HTTP ${response.statusCode}`,
          message: response.statusMessage || "Failed to fetch the webpage"
        });
      }

      const chunks: Buffer[] = [];
      
      response.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      response.on("end", () => {
        try {
          const htmlString = Buffer.concat(chunks).toString("utf8");
          
          // Parse HTML with Cheerio
          const $ = cheerio.load(htmlString);
          
          // Remove unwanted elements
          $(
            "script, style, link, meta, noscript, iframe, svg, nav, aside, header, footer, .advertisement, .ads, .social-share, .comments"
          ).remove();
          
          // Get main content, preferring article/main elements
          let content = "";
          if ($("article").length > 0) {
            content = $("article").first().html() || "";
          } else if ($("main").length > 0) {
            content = $("main").first().html() || "";
          } else if ($(".content, .post-content, .entry-content").length > 0) {
            content = $(".content, .post-content, .entry-content").first().html() || "";
          } else {
            content = $("body").html() || htmlString;
          }
          
          // Convert to markdown
          const markdown = turndown.turndown(content);
          
          // Clean up extra whitespace
          const cleanMarkdown = markdown
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
            .replace(/^\s+|\s+$/g, '') // Trim whitespace
            .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '') // Remove nested image links
            .trim();

          if (!cleanMarkdown || cleanMarkdown.length < 50) {
            return res.status(422).json({
              error: "No content extracted",
              message: "The webpage appears to have no readable content or may be behind a paywall/login"
            });
          }
          
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.send(cleanMarkdown);
          
        } catch (parseError) {
          console.error("Parsing error:", parseError);
          res.status(500).json({
            error: "Content parsing failed",
            message: "Failed to parse the webpage content. The site may use complex JavaScript rendering."
          });
        }
      });
    });

    request.on("error", (error: Error) => {
      console.error("Request error:", error);
      
      let errorMessage = "Failed to fetch the webpage";
      if (error.message.includes("ENOTFOUND")) {
        errorMessage = "Domain not found. Please check the URL is correct.";
      } else if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "Connection refused. The server may be down.";
      } else if (error.message.includes("ETIMEDOUT")) {
        errorMessage = "Request timed out. The server is taking too long to respond.";
      } else if (error.message.includes("certificate")) {
        errorMessage = "SSL certificate error. The site may have security issues.";
      }
      
      res.status(500).json({
        error: "Network error",
        message: errorMessage
      });
    });

    request.on("timeout", () => {
      request.destroy();
      res.status(408).json({
        error: "Request timeout",
        message: "The request took too long to complete. Please try again."
      });
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
