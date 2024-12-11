import pandas as pd

# 讀取 CSV 檔案
file_path = 'merged_combined_levels.csv'
data = pd.read_csv(file_path)

# 定義 Level 與對應的欄位名稱映射
level_column_mapping = {
    0: 'level 0 content',
    1: 'level 1 content',
    2: 'level 2 content',
    3: 'level 3 content',
    4: 'level 4 content',
    5: 'level 5 content',
    6: 'level 6 content'
}

# 已展示報導的記錄
displayed_reports = []  # 使用列表來記錄歷史展示的報導
displayed_index = -1  # 當前展示報導在歷史中的索引


def get_preferred_level():
    """讓用戶選擇偏好的 Level"""
    available_levels = list(level_column_mapping.keys())
    print("請選擇你偏好的難度 Level（可選：0 ~ 6）：")
    while True:
        preferred_level = input("請輸入偏好的 Level 編號：")
        if preferred_level.isdigit() and int(preferred_level) in available_levels:
            return int(preferred_level)
        print("無效的 Level 選擇，請重新輸入 0 ~ 6：")


def get_preferred_theme():
    """讓用戶選擇偏好的 Theme"""
    available_themes = data['Theme'].dropna().unique()
    print("\n可用的 Themes：")
    print(", ".join(available_themes))
    while True:
        preferred_theme = input("請輸入偏好的 Theme：")
        if preferred_theme in available_themes:
            return preferred_theme
        print("無效的 Theme 選擇，請重新輸入：")


def display_report(preferred_level, preferred_theme, report=None):
    """顯示指定的報導，若未指定則隨機選擇"""
    global displayed_reports, displayed_index
    column_to_search = level_column_mapping[preferred_level]

    if report is None:  # 隨機選擇新報導
        filtered_data = data[(data['Theme'] == preferred_theme) & pd.notna(data[column_to_search])]
        # 排除已展示的報導
        filtered_data = filtered_data[~filtered_data['Title'].isin([r['Title'] for r in displayed_reports])]
        if filtered_data.empty:
            print(f"沒有更多符合 Theme '{preferred_theme}' 和 Level {preferred_level} 的新資料。")
            return False
        report = filtered_data.sample(n=1).to_dict(orient='records')[0]
        displayed_reports.append(report)
        displayed_index = len(displayed_reports) - 1
    else:
        # 顯示歷史中的指定報導
        displayed_index = displayed_reports.index(report)

    print(f"\n展示的報導，符合 Theme: {preferred_theme} 和 Level {preferred_level}：")
    print(f"Title: {report['Title']}")
    print(f"Level {preferred_level} Content: {report[column_to_search]}")

    print("\n完整報導內容：")
    for key, value in report.items():
        if pd.notna(value):  # 忽略空值
            print(f"{key}: {value}")
    return True


def view_browsing_history():
    """查看瀏覽過的報導標題"""
    if not displayed_reports:
        print("目前沒有瀏覽紀錄。")
    else:
        print("\n已瀏覽的報導標題：")
        for i, report in enumerate(displayed_reports, start=1):
            print(f"{i}. {report['Title']}")


def main():
    """主程式流程"""
    global displayed_index
    print("歡迎使用報導推薦系統！")
    preferred_level = get_preferred_level()
    preferred_theme = get_preferred_theme()

    while True:
        if displayed_index == -1 or displayed_index >= len(displayed_reports):
            has_more_reports = display_report(preferred_level, preferred_theme)
        else:
            has_more_reports = True

        print("\n你想要繼續做什麼？")
        print("1. 關閉系統")
        print("2. 調整 Level")
        print("3. 調整 Theme")
        print("4. 下一頁")
        print("5. 上一頁")
        print("6. 查看瀏覽紀錄")
        print("7. 展示新報導")
        choice = input("請輸入選項（1/2/3/4/5/6/7）：")

        if choice == "1":
            print("感謝使用，再見！")
            break
        elif choice == "2":
            print("重新選擇 Level：")
            preferred_level = get_preferred_level()
            displayed_index = -1  # 重置瀏覽狀態
        elif choice == "3":
            print("重新選擇 Theme：")
            preferred_theme = get_preferred_theme()
            displayed_index = -1  # 重置瀏覽狀態
        elif choice == "4":
            if displayed_index < len(displayed_reports) - 1:
                displayed_index += 1
                display_report(preferred_level, preferred_theme, displayed_reports[displayed_index])
            else:
                print("已經是最後一篇，無法顯示更後面的報導。")
        elif choice == "5":
            if displayed_index > 0:
                displayed_index -= 1
                display_report(preferred_level, preferred_theme, displayed_reports[displayed_index])
            else:
                print("已經是第一篇，無法顯示更前面的報導。")
        elif choice == "6":
            view_browsing_history()
        elif choice == "7":
            print("隨機挑選一篇新報導...")
            display_report(preferred_level, preferred_theme)
        else:
            print("無效選擇，請重新輸入。")


if __name__ == "__main__":
    main()
