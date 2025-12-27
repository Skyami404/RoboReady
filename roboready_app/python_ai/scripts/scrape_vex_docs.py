# scripts/scrape_vex_docs.py
# Scrape VEX documentation from official websites
# Note: This is a basic example - real scraping would be more complex

import requests
from pathlib import Path
import time

def scrape_url(url, output_file):
    """
    Fetch content from URL and save as text
    """
    try:
        print(f"Fetching: {url}")
        headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; VEXBot/1.0)'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Extract text (simplified - real scraping would parse HTML properly)
        text = response.text
        
        # Remove HTML tags (basic approach)
        import re
        text = re.sub('<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
        text = re.sub('<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
        text = re.sub('<[^>]+>', '\n', text)
        text = re.sub('\s+', ' ', text)
        text = text.strip()
        
        # Save to file
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"# Scraped from: {url}\n\n")
            f.write(text)
        
        print(f"✓ Saved to: {output_file}")
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    """
    Scrape VEX documentation
    """
    print("=" * 60)
    print("VEX Documentation Scraper")
    print("=" * 60)
    print("\n⚠️  Note: This is a basic example.")
    print("   For production, use proper web scraping tools like:")
    print("   - BeautifulSoup4")
    print("   - Scrapy")
    print("   - Selenium (for JavaScript-heavy sites)")
    print()
    
    # Define URLs to scrape
    urls = [
        {
            'url': 'https://kb.vex.com/hc/en-us',
            'output': 'data/vex_guides/vex_knowledge_base.txt'
        },
        # Add more URLs as needed
    ]
    
    data_dir = Path(__file__).parent.parent / 'data'
    
    print(f"📂 Output directory: {data_dir}\n")
    
    successful = 0
    failed = 0
    
    for item in urls:
        url = item['url']
        output = data_dir / item['output']
        
        if scrape_url(url, output):
            successful += 1
        else:
            failed += 1
        
        # Be polite - don't hammer servers
        time.sleep(2)
    
    print(f"\n" + "=" * 60)
    print(f"Scraping complete!")
    print(f"✓ Successful: {successful}")
    print(f"✗ Failed: {failed}")
    print("=" * 60)
    
    print(f"\n💡 Next steps:")
    print(f"1. Review scraped files in {data_dir}")
    print(f"2. Clean up and organize content")
    print(f"3. Run: python scripts/build_knowledge_base.py")
    print(f"4. Test: python vex_assistant.py")

if __name__ == '__main__':
    print("\n⚠️  WARNING: Web scraping may be against terms of service!")
    print("   Always check website's robots.txt and terms of service")
    print("   Consider using official APIs or asking for permission")
    print()
    
    response = input("Continue? (yes/no): ")
    if response.lower() in ['yes', 'y']:
        main()
    else:
        print("Aborted.")

# ==============================================================================
# PRODUCTION SCRAPING EXAMPLE (using BeautifulSoup)
# ==============================================================================
"""
import requests
from bs4 import BeautifulSoup

def scrape_vex_kb_article(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Extract title
    title = soup.find('h1').get_text() if soup.find('h1') else 'Untitled'
    
    # Extract main content
    content_div = soup.find('article') or soup.find('main')
    if content_div:
        # Remove navigation, ads, etc.
        for unwanted in content_div.find_all(['nav', 'aside', 'footer']):
            unwanted.decompose()
        
        content = content_div.get_text(separator='\n', strip=True)
    else:
        content = soup.get_text(separator='\n', strip=True)
    
    return {
        'title': title,
        'content': content,
        'url': url
    }

# Example usage:
# article = scrape_vex_kb_article('https://kb.vex.com/hc/en-us/articles/...')
# save_to_file(article)
"""