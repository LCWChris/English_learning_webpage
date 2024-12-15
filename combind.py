import pandas as pd
import os

# 設定工作目錄
os.chdir("C:/Users/User/Documents/企業資料通訊/期末/level")

# 定義 CSV 文件路徑
csv_files = [
    "level_0.csv",
    "level_1.csv",
    "level_2.csv",
    "level_3.csv",
    "level_4.csv",
    "level_5.csv",
    "level_6.csv"
]

# 初始化一個空的 DataFrame
combined_df = pd.DataFrame()

# 遍歷每個 CSV 文件，讀取數據
for i, file in enumerate(csv_files):
    level = f"level {i} content"
    df = pd.read_csv(file)
    df = df.rename(columns={"Content": level, "Level Tag": f"Level {i} Tag"})
    df = df[["Date", "Title", level]]  # 保留需要的列
    
    # 合併數據，根據 Title 進行合併
    if combined_df.empty:
        combined_df = df
    else:
        combined_df = pd.merge(combined_df, df, on=["Date", "Title"], how="outer")

# 填充缺失值為空字符串
combined_df = combined_df.fillna("")

# 保存合併後的文件為 Excel 格式
combined_df.to_excel("combined_levels.xlsx", index=False)

print("合併完成，結果已保存到 combined_levels.xlsx 文件中。")
