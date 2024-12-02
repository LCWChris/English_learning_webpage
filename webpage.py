from flask import Flask, render_template, request
import pandas as pd

app = Flask(__name__)

# 讀取並處理 CSV 資料
df = pd.read_csv("merged_combined_levels.csv")
articles = []
for _, row in df.iterrows():
    for level in range(7):
        content = row[f"level {level} content"]
        if pd.notnull(content):
            articles.append({
                "Date": row["Date"],
                "Title": row["Title"],
                "Theme": row["Theme"],
                "Level": level,
                "Content": content
            })
expanded_df = pd.DataFrame(articles)

@app.route("/")
def index():
    # 獲取所有文章
    articles = expanded_df.to_dict('records')
    return render_template("index.html", articles=articles)

@app.route("/filter", methods=["GET"])
def filter_articles():
    # 根據篩選條件過濾文章
    level = request.args.get("level", type=int)
    theme = request.args.get("theme", type=str)

    filtered = expanded_df
    if level is not None:
        filtered = filtered[filtered["Level"] == level]
    if theme:
        filtered = filtered[filtered["Theme"].str.contains(theme, case=False)]

    articles = filtered.to_dict('records')
    return render_template("index.html", articles=articles)

if __name__ == "__main__":
    app.run(debug=True)
