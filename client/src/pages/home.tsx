import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, 
  Download, 
  Copy, 
  Filter, 
  FileText, 
  Shield, 
  Loader2,
  AlertTriangle,
  Link as LinkIcon,
  CheckCircle
} from "lucide-react";
import { scrapeUrl } from "@/lib/api";

export default function Home() {
  const [url, setUrl] = useState("");
  const [scrapedContent, setScrapedContent] = useState("");
  const { toast } = useToast();

  const scrapeMutation = useMutation({
    mutationFn: scrapeUrl,
    onSuccess: (data) => {
      setScrapedContent(data);
      toast({
        title: "Success!",
        description: "Website content scraped successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Scraping Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    
    try {
      new URL(url);
      scrapeMutation.mutate(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(scrapedContent);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary text-white p-2 rounded-lg">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Web Scraper API</h1>
              <p className="text-slate-600 text-sm">Convert any webpage to clean markdown text</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* API Documentation Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">API Documentation</CardTitle>
            <p className="text-slate-600">Simple REST API for extracting clean text content from web pages</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">GET</Badge>
                <code className="text-sm font-mono text-slate-700">/api/scrape</code>
              </div>
              <p className="text-sm text-slate-600 mb-3">Scrape text content from a webpage and convert to markdown</p>
              <div className="text-sm">
                <strong className="text-slate-700">Query Parameters:</strong>
                <ul className="mt-1 space-y-1 text-slate-600">
                  <li><code className="bg-slate-100 px-1 rounded text-xs">url</code> - The webpage URL to scrape (required)</li>
                </ul>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <strong className="text-slate-700 text-sm">Example Request:</strong>
              <code className="block mt-2 bg-slate-800 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                curl "http://localhost:5000/api/scrape?url=https://example.com"
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Interactive API Tester */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Tester</CardTitle>
            <p className="text-slate-600">Test the API directly from your browser</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <div className="relative">
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <LinkIcon className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={scrapeMutation.isPending}
              >
                {scrapeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Scrape Website
                  </>
                )}
              </Button>
            </form>

            {/* Loading State */}
            {scrapeMutation.isPending && (
              <Alert className="mt-6 border-blue-200 bg-blue-50">
                <Loader2 className="w-4 h-4 animate-spin" />
                <AlertDescription className="text-blue-800 font-medium">
                  Scraping website...
                </AlertDescription>
              </Alert>
            )}

            {/* Error State */}
            {scrapeMutation.error && (
              <Alert className="mt-6 border-red-200 bg-red-50" variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <h4 className="font-medium">Error</h4>
                  <p className="text-sm mt-1">{scrapeMutation.error.message}</p>
                </AlertDescription>
              </Alert>
            )}

            {/* Results Section */}
            {scrapedContent && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Scraped Content</h3>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </Button>
                </div>
                <Card>
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Markdown Output</span>
                    <span className="text-xs text-slate-500">{scrapedContent.length} characters</span>
                  </div>
                  <CardContent className="p-0">
                    <Textarea 
                      value={scrapedContent}
                      readOnly
                      className="min-h-64 font-mono text-sm resize-none border-0 focus:ring-0 rounded-t-none"
                      placeholder="Scraped content will appear here..."
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Filter className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Clean Extraction</h3>
            <p className="text-slate-600 text-sm">Removes scripts, styles, and other unwanted elements for clean text content</p>
          </Card>
          
          <Card className="p-6">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Markdown Conversion</h3>
            <p className="text-slate-600 text-sm">Converts HTML to well-formatted markdown for easy processing</p>
          </Card>
          
          <Card className="p-6">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Error Handling</h3>
            <p className="text-slate-600 text-sm">Robust error handling for invalid URLs and failed requests</p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            Built with Express.js, Cheerio, and Turndown. 
            <a href="#" className="text-primary hover:text-blue-600 font-medium ml-1">View Source Code</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
