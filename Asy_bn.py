# -*- coding: utf-8 -*-
"""
Created on Sat Nov 30 16:18:38 2024

@author: User
"""
import os
import csv
import asyncio
import aiohttp
from bs4 import BeautifulSoup

# 設定工作目錄
os.chdir("C:/Users/User/Documents/企業資料通訊/期末/Themes")

# 要抓取的 URL
url = "https://breakingnewsenglish.com/business_english.html"

# 添加 User-Agent 標頭模擬瀏覽器
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# 定義異步函數以加速抓取
async def fetch(session, url):
    """使用 aiohttp 發送請求"""
    async with session.get(url, headers=HEADERS) as response:
        return await response.text()

async def scrape_article(session, link, writer):
    """抓取文章詳細內容"""
    try:
        article_url = f"https://breakingnewsenglish.com/{link}"
        article_html = await fetch(session, article_url)
        article_soup = BeautifulSoup(article_html, 'html.parser')
        
        # 提取標題和其他內容
        main_div = article_soup.find('div', id='main', class_='section')
        level_tag_h3 = main_div.find('h3') if main_div else None
        level_tag_content = 'Level ' + level_tag_h3.get_text(strip=True).split('Level')[-1].strip() if level_tag_h3 else "No level tag content found"

        primary_div = article_soup.find('div', id='primary', class_='content-area match-height')
        lesson_excerpt = primary_div.find('div', class_='lesson-excerpt content-container') if primary_div else None
        article_paragraphs = lesson_excerpt.find_all('p') if lesson_excerpt else []
        article_content = "\n".join(p.get_text(strip=True) for p in article_paragraphs)

        # 如果內容為空，跳過
        if not article_content.strip():
            return
        
        # 清理 Content 中的 "Try the same news story" 及後面部分
        article_content = article_content.split("Try the same news story")[0].strip()

        # 提取日期和標題
        title = article_soup.title.string.strip() if article_soup.title else "Unknown Title"
        date = article_url.split("/")[-1].replace(".html", "")  # 模擬日期提取

        # 寫入 CSV
        writer.writerow([date, title, level_tag_content, article_content, "Business English"])
    except Exception as e:
        print(f"Error processing article {link}: {e}")

async def scrape_website():
    """主函數抓取網頁內容"""
    async with aiohttp.ClientSession() as session:
        # 抓取目錄頁面
        html = await fetch(session, url)
        soup = BeautifulSoup(html, 'html.parser')

        # 找到文章鏈接
        ul_tag = soup.find('ul', class_='list-class')
        if not ul_tag:
            print("Could not find the specified <ul> element.")
            return
        li_tags = ul_tag.find_all('li')
        links = [li.find('a')['href'] for li in li_tags if li.find('a')]

        # 打開 CSV 文件並抓取所有文章
        with open('breaking_news_articles_test.csv', mode='a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            # 寫入 CSV 標題行（如果是新文件）
            if file.tell() == 0:
                writer.writerow(["Date", "Title", "Level Tag", "Content", "Theme"])
            
            # 使用異步處理所有文章鏈接
            tasks = [scrape_article(session, link, writer) for link in links]
            await asyncio.gather(*tasks)

# 執行異步爬蟲
asyncio.run(scrape_website())
