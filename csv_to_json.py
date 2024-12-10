import pandas as pd
import json

# 定義輸入與輸出檔案名稱
csv_file = "merged_combined_levels.csv"  # 請替換為您的 CSV 檔案名稱
output_json = "articles.json"  # 請替換為您希望輸出的 JSON 檔案名稱

# 讀取 CSV 檔案
try:
    df = pd.read_csv(csv_file)

    # 初始化結果列表
    articles = []

    # 遍歷每一列，處理資料
    for _, row in df.iterrows():
        # 提取必填欄位
        date = row.get("Date", "").strip()
        title = row.get("Title", "").strip()
        theme = row.get("Theme", "").strip()

        # 跳過缺少必要欄位的資料
        if not date or not title or not theme:
            continue

        # 提取有內容的 level 欄位
        content_data = {}
        for level in range(0, 7):  # level 0 到 level 6
            level_col = f"level {level} content"
            if pd.notna(row.get(level_col)) and row[level_col].strip():
                content_data[level_col] = row[level_col].strip()

        # 如果有內容，則記錄
        if content_data:
            articles.append({
                "Date": date,
                "Title": title,
                "Theme": theme,
                "Content": content_data
            })

    # 將結果寫入 JSON 檔案
    with open(output_json, "w", encoding="utf-8") as json_file:
        json.dump(articles, json_file, ensure_ascii=False, indent=4)

    print(f"成功將 CSV 資料轉換為 JSON！輸出檔案為 {output_json}")

except Exception as e:
    print(f"發生錯誤: {e}")
