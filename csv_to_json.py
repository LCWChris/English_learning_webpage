import pandas as pd
import json

# 定義輸入 CSV 檔案與輸出 JSON 檔案
csv_file = "merged_combined_levels.csv"
output_json = "articles.json"

# 讀取 CSV 並轉換資料
try:
    # 讀取 CSV
    df = pd.read_csv(csv_file)
    
    # 初始化結果列表
    articles = []

    # 遍歷每一列，處理資料
    for _, row in df.iterrows():
        # 確保標題和主題有值
        title = row.get("Title", "").strip()
        theme = row.get("Theme", "").strip()
        date = row.get("Date", "").strip()

        if not title or not theme or not date:
            continue  # 跳過空的必填欄位
        
        # 找出內文（level 0 content ~ level 6 content）
        content_col = [col for col in df.columns if "content" in col.lower()]
        content = None
        level = None
        for col in content_col:
            if pd.notna(row[col]) and row[col].strip():  # 選取第一個非空值
                content = row[col].strip()
                level = int(col.split()[-2])  # 提取 Level 值，假設格式為 "level X content"
                break

        if content:  # 如果找到了內文，新增進列表
            articles.append({
                "Title": title,
                "Theme": theme,
                "Date": date,
                "Level": level,
                "Content": content
            })

    # 將結果寫入 JSON 檔案
    with open(output_json, "w", encoding="utf-8") as json_file:
        json.dump(articles, json_file, ensure_ascii=False, indent=4)
    
    print(f"成功將 CSV 資料轉換為 JSON！輸出檔案為 {output_json}")

except Exception as e:
    print(f"發生錯誤: {e}")
