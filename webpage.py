import pandas as pd

# 讀取 CSV 檔案
df = pd.read_csv("merged_combined_levels.csv")

# 將其轉換為 JSON 格式
df.to_json("articles.json", orient="records", force_ascii=False)