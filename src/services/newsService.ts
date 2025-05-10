import { NewsItem } from '../context/DataContext.tsx';

const FEED_SOURCES = [
    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "https://www.moneycontrol.com/rss/latestnews.xml",
    "https://news.google.com/rss/search?q=indian+stocks&hl=en-IN&gl=IN&ceid=IN:en",
];

// Publisher name mapping
const PUBLISHER_NAMES: Record<string, string> = {
    'economictimes.indiatimes.com': 'Economic Times',
    'moneycontrol.com': 'MoneyControl',
    'news.google.com': 'Google Finance',
};

// Try different CORS proxy services
const CORS_PROXIES = [
    "https://api.allorigins.win/raw?url=",
    "https://cors-anywhere.herokuapp.com/",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://corsproxy.io/?",
    "https://proxy.cors.sh/",
    "https://corsproxy.org/",
    "https://api.cors.sh/",
    "https://cors.sh/",
    "https://cors.bridged.cc/",
    "https://cors.eu.org/",
    "https://cors.deno.dev/",
    "https://corsproxy.io/",
    "https://corsproxy.io/raw?url=",
    "https://thingproxy.freeboard.io/fetch/",
    "https://api.scraperapi.com/?url=",
    "https://api.proxyscrape.com/v2/?url=",
    "https://api.scrapingdog.com/proxy?url=",
    "https://proxy.scrapeops.io/v1/?url=",
    "https://api.webscraping.ai/raw?url=",
    "https://cors-proxy.htmldriven.com/?url=",
    "https://crossorigin.me/",
    "https://cors-proxy.taskcluster.net/",
    "https://yacdn.org/proxy/",
    "https://api.scrapingant.com/v2/general?url=",
    "https://proxy.scrapeapi.io/?url="
];

const getTimeDiffString = (publishedDate: Date): string => {
    const now = new Date();
    const diff = now.getTime() - publishedDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
};

const extractImageFromEntry = (entry: Element): string | undefined => {
    // Check for media_content
    const mediaContent = entry.querySelector('media\\:content, content');
    if (mediaContent?.getAttribute('url')) {
        return mediaContent.getAttribute('url') || undefined;
    }

    // Check for content
    const content = entry.querySelector('content');
    if (content?.textContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content.textContent, 'text/html');
        const img = doc.querySelector('img');
        if (img?.src) return img.src;
    }

    // Check for summary
    const summary = entry.querySelector('description');
    if (summary?.textContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(summary.textContent, 'text/html');
        const img = doc.querySelector('img');
        if (img?.src) return img.src;
    }

    return undefined;
};

const parseDate = (dateStr: string): Date => {
    const parsedDate = new Date(dateStr);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

const fetchWithProxy = async (url: string): Promise<string> => {
    let lastError: Error | null = null;
    
    // Try each proxy in sequence
    for (const proxy of CORS_PROXIES) {
        try {
            const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl, {
                headers: {
                    'Accept': 'application/xml, text/xml, */*',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.text();
        } catch (error) {
            lastError = error as Error;
            console.warn(`Failed with proxy ${proxy}:`, error);
            // Try next proxy
            continue;
        }
    }
    
    // If all proxies failed, try direct fetch as last resort
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/xml, text/xml, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.text();
    } catch (error) {
        throw lastError || error;
    }
};

export const fetchNews = async (): Promise<NewsItem[]> => {
    const allNews: NewsItem[] = [];
    const sourceNews: Record<string, NewsItem[]> = {};

    // Initialize source news arrays
    Object.values(PUBLISHER_NAMES).forEach(source => {
        sourceNews[source] = [];
    });

    for (const rssUrl of FEED_SOURCES) {
        try {
            const text = await fetchWithProxy(rssUrl);
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/xml');

            // Handle different RSS feed formats
            const items = doc.querySelectorAll('item, entry');
            const domain = rssUrl.split('/')[2];
            const source = PUBLISHER_NAMES[domain] || domain;

            items.forEach((item) => {
                const title = item.querySelector('title')?.textContent?.trim() || '';
                const link = item.querySelector('link')?.textContent?.trim() || 
                           item.querySelector('link')?.getAttribute('href')?.trim() || '';
                const pubDate = item.querySelector('pubDate, published, updated')?.textContent?.trim() || '';
                const description = item.querySelector('description, summary, content')?.textContent?.trim() || '';

                if (!title || !link) return; // Skip if no title or link

                // Parse and convert pubDate to Date object
                const publishedDate = parseDate(pubDate);

                // Extract image if available
                const imageUrl = extractImageFromEntry(item);

                const newsItem: NewsItem = {
                    title,
                    link,
                    source,
                    date: getTimeDiffString(publishedDate),
                    description: description.substring(0, 150) + '...',
                    imageUrl,
                    timestamp: publishedDate.getTime()
                };

                sourceNews[source].push(newsItem);
            });
        } catch (error) {
            console.error(`Failed to fetch ${rssUrl}:`, error);
            // Continue with other feeds even if one fails
            continue;
        }
    }

    // Ensure at least 5 items from each source
    Object.entries(sourceNews).forEach(([source, items]) => {
        if (items.length < 5) {
            console.warn(`Warning: Only ${items.length} items fetched from ${source}`);
        }
        // Sort items by timestamp (newest first) for each source
        items.sort((a, b) => b.timestamp - a.timestamp);
        allNews.push(...items);
    });

    // Final sort of all news items by timestamp
    return allNews.sort((a, b) => b.timestamp - a.timestamp);
}; 