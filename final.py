import pandas as pd
import os

# 設定工作目錄
os.chdir("C:/Users/User/Documents/企業資料通訊/期末")

# 讀取 CSV 文件
combined_levels = pd.read_csv("combined_levels.csv")
cleaned_combined_theme_levels = pd.read_csv("cleaned_combined_theme_levels.csv")

# 選擇需要的欄位
columns_to_keep_from_combined = [
    "Date", "Title", "level 0 content", "level 1 content", "level 2 content", 
    "level 3 content", "level 4 content", "level 5 content", "level 6 content"
]
columns_to_keep_from_cleaned = ["Title", "Theme"]

# 確保只保留需要的欄位
combined_levels = combined_levels[columns_to_keep_from_combined]
cleaned_combined_theme_levels = cleaned_combined_theme_levels[columns_to_keep_from_cleaned]

# 基於 Title 進行合併
merged_df = pd.merge(combined_levels, cleaned_combined_theme_levels, on="Title", how="left")

# 填充 Theme 欄位中的空值為 "Others"
merged_df["Theme"] = merged_df["Theme"].fillna("Others")

# 將 Theme 移動到第三列
cols = merged_df.columns.tolist()
theme_index = cols.index("Theme")
cols.insert(2, cols.pop(theme_index))  # 將 Theme 插入到第三列位置
merged_df = merged_df[cols]

# 保存合併後的數據到 CSV 文件
merged_df.to_csv("merged_combined_levels.csv", index=False, encoding="utf-8-sig")

# 保存合併後的數據到 Excel 文件
merged_df.to_excel("merged_combined_levels.xlsx", index=False)

print("合併完成，結果已保存到 merged_combined_levels.csv 和 merged_combined_levels.xlsx 文件中，並將 Theme 放置在第三列，空值已填充為 'Others'。")
