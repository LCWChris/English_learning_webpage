# -*- coding: utf-8 -*-
"""
Created on Sat Nov 30 16:18:38 2024

@author: User
"""
import os
import asyncio
import aiohttp
from aiohttp import ClientSession
from bs4 import BeautifulSoup
import csv

# 設定工作目錄
os.chdir("C:/Users/User/Documents/企業資料通訊/期末/level")

# 要抓取的 URL
url = "https://breakingnewsenglish.com/graded-news-articles.html"

# 添加 User-Agent 標頭模擬瀏覽器
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# 定義異步函數抓取文章內容
async def fetch_article(session, article_url, date, title):
    try:
        async with session.get(article_url) as response:
            if response.status == 200:
                html = await response.text()
                article_soup = BeautifulSoup(html, 'html.parser')
                
                # 將 Level Tag 設置為 Level 0
                level_tag_content = 'Level 4'
                
                # 找到 <div id="primary" class="content-area match-height"> 中的文章內容
                primary_div = article_soup.find('div', id='primary', class_='content-area match-height')
                lesson_excerpt = primary_div.find('div', class_='lesson-excerpt content-container') if primary_div else None
                article_paragraphs = lesson_excerpt.find_all('p') if lesson_excerpt else []
                article_content = "\n".join(p.get_text(strip=True) for p in article_paragraphs)
                
                # 如果找不到文章內容，則跳過該文章
                if not article_content.strip():
                    return None
                
                return [date, title, level_tag_content, article_content]
            else:
                print(f"Failed to retrieve the article page. Status code: {response.status}")
                return None
    except Exception as e:
        print(f"Error fetching article {article_url}: {e}")
        return None

# 定義異步函數抓取網頁內容
async def scrape_website():
    async with ClientSession(headers=headers) as session:
        async with session.get(url) as response:
            if response.status == 200:
                soup = BeautifulSoup(await response.text(), 'html.parser')
                ul_tag = soup.find('ul', class_='list-class')
                
                if ul_tag:
                    li_tags = ul_tag.find_all('li')
                    tasks = []
                    
                    # 遍歷每個 <li>，提取日期和文章標題
                    for li in li_tags:
                        a_tag = li.find('a')
                        link = a_tag['href']
                        article_url = f"https://breakingnewsenglish.com/{link}"
                        date = li.find('tt').get_text(strip=True).replace(':', '')
                        title = a_tag.get_text(strip=True)
                        tasks.append(fetch_article(session, article_url, date, title))
                    
                    # 執行所有抓取任務
                    results = await asyncio.gather(*tasks)
                    
                    # 打開 CSV 文件以寫入
                    with open('level_4.csv', mode='w', newline='', encoding='utf-8') as file:
                        writer = csv.writer(file)
                        writer.writerow(["Date", "Title", "Level Tag", "Content"])
                        
                        for result in results:
                            if result:
                                writer.writerow(result)
            else:
                print(f"Failed to retrieve the page. Status code: {response.status}")

# 執行異步函數
asyncio.run(scrape_website())
