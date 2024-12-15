# -*- coding: utf-8 -*-
"""
Created on Sat Nov 30 16:18:38 2024

@author: User
"""
import os
import requests
from bs4 import BeautifulSoup
import csv

# 設定工作目錄
os.chdir("C:/Users/User/Documents/企業資料通訊/期末")

# 要抓取的 URL
url = "https://breakingnewsenglish.com/education.html"

# 添加 User-Agent 標頭模擬瀏覽器
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}


# 定義函數抓取網頁內容
def scrape_website():
    # 發送 GET 請求到目標網站
    response = requests.get(url, headers=headers)

    # 檢查請求是否成功
    if response.status_code == 200:
        # 使用 BeautifulSoup 解析 HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 找到 class="list-class" 的 <ul> 標籤
        ul_tag = soup.find('ul', class_='list-class')
        
        if ul_tag:
            # 從 <ul> 中找到所有 <li> 標籤
            li_tags = ul_tag.find_all('li')
            
            # 打開 CSV 文件以追加模式寫入
            with open('education.csv', mode='a', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                # 寫入 CSV 標題行（如果是新文件）
                if file.tell() == 0:
                    writer.writerow(["Date", "Title", "Level Tag", "Content", "Theme"])
                
                # 遍歷每個 <li>，提取日期和文章標題
                for li in li_tags:
                    # 找到 <a> 標籤中的文章標題和鏈接
                    a_tag = li.find('a')
                    link = a_tag['href']
                    article_url = f"https://breakingnewsenglish.com/{link}"

                                        
                    # 找到 <tt> 標籤中的日期
                    date = li.find('tt').get_text(strip=True).replace(':', '')
                    title = a_tag.get_text(strip=True)
                    
                    # 發送 GET 請求到文章頁面
                    article_response = requests.get(article_url, headers=headers)
                    
                    if article_response.status_code == 200:
                        # 使用 BeautifulSoup 解析文章頁面 HTML
                        article_soup = BeautifulSoup(article_response.text, 'html.parser')
                        
                        # 找到 <h3> 標籤中的內容
                        main_div = article_soup.find('div', id='main', class_='section')
                        if main_div:
                            level_tag_h3 = main_div.find('h3')
                            level_tag_content = 'Level ' + level_tag_h3.get_text(strip=True).split('Level')[-1].strip() if level_tag_h3 else "No level tag content found"
                        else:
                            level_tag_content = "No level tag content found"
                        
                        # 找到 <div id="primary" class="content-area match-height"> 中的文章內容
                        primary_div = article_soup.find('div', id='primary', class_='content-area match-height')
                        lesson_excerpt = primary_div.find('div', class_='lesson-excerpt content-container') if primary_div else None
                        article_paragraphs = lesson_excerpt.find_all('p') if lesson_excerpt else []
                        article_content = "\n".join(p.get_text(strip=True) for p in article_paragraphs)
                        
                        # 如果找不到文章內容，則跳過該文章
                        if not article_content.strip():
                            continue
                        
                        # 寫入 CSV 文件
                        writer.writerow([date, title, level_tag_content, article_content, "education"])
                    else:
                        print(f"Failed to retrieve the article page. Status code: {article_response.status_code}")
        else:
            print("Could not find the specified <ul> element.")
    else:
        print(f"Failed to retrieve the page. Status code: {response.status_code}")

scrape_website()
