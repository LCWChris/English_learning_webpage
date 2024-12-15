import pandas as pd
import re
import os
os.chdir("C:/Users/User/Documents/企業資料通訊/期末/Themes")

# 讀取 CSV 文件
file_path = "combined_theme_levels.csv"
df = pd.read_csv(file_path)

# 定義需要移除的正則表達式
pattern_to_remove = r"Try the same news story.*?Please enjoy :-\)"

# 遍歷每個欄位，移除不需要的部分
for col in df.columns:
    if df[col].dtype == 'object':  # 確保是文字欄位
        df[col] = df[col].str.replace(pattern_to_remove, "", regex=True)

# 保存清理後的數據到 Excel 文件
cleaned_file_path = "cleaned_combined_theme_levels.xlsx"
df.to_excel(cleaned_file_path, index=False)

print(f"清理完成，已保存到 {cleaned_file_path}")
