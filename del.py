import pandas as pd

# 讀取 CSV 文件
file_path = "combined_levels.csv"
df = pd.read_csv(file_path)

# 定義需要移除的文字
texts_to_remove = [
    "Try the same news story at these levels:",
    "Pressure Groups - Level 5orPressure Groups - Level 6",
    "Make sure you try all of the online activities for this reading and listening - There are dictations, multiple choice, drag and drop activities, crosswords, hangman, flash cards, matching activities and a whole lot more. Please enjoy :-)"
]

# 遍歷每個欄位，移除不需要的文字
for col in df.columns:
    if df[col].dtype == 'object':  # 確保是文字欄位
        for text in texts_to_remove:
            df[col] = df[col].str.replace(text, "", regex=False)

# 保存清理後的數據到 Excel 文件
cleaned_file_path = "cleaned_combined_levels.xlsx"
df.to_excel(cleaned_file_path, index=False)

print(f"清理完成，已保存到 {cleaned_file_path}")
