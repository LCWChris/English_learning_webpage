import pandas as pd
import os
os.chdir("C:/Users/User/Documents/企業資料通訊/期末/Themes")
# 定義 CSV 文件路徑
csv_files = [
    "business_english.csv",
    "education.csv",
    "environment.csv",
    "health.csv",
    "issues.csv",
    "lifestyle.csv",
    "People_Gossip.csv",
    "technology.csv",
    "world-news.csv"
]

# 初始化一個空的 DataFrame
combined_df = pd.DataFrame()

# 遍歷每個 CSV 文件，讀取數據並合併
for file in csv_files:
    df = pd.read_csv(file)
    df = df[["Date", "Title", "Level Tag", "Content", "Theme"]]
    
    # 合併數據，根據 Date 和 Title 進行合併
    if combined_df.empty:
        combined_df = df
    else:
        combined_df = pd.concat([combined_df, df], ignore_index=True)

# 填充缺失值為空字符串
combined_df = combined_df.fillna("")

# 保存合併後的文件
combined_df.to_csv("combined_theme_levels.csv", index=False, encoding='utf-8')

print("合併完成，結果已保存到 combined_theme_levels.csv 文件中。")