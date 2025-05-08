import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from scipy.sparse import coo_matrix, hstack
from fmlite import FMLite
from scipy.sparse import csr_matrix
import joblib

def recommend_for_user(gender, status, model = joblib.load('./fm_model.pkl'), top_k=3):
    # 特徵對應的編碼
    gender_map = {'m': 0, 'f': 1}
    status_map = {'student': 0, 'white_collar': 1, 'blue_collar': 2, 'household': 3, 'elderly': 4}
    item_map = {'Handbag': 0, 'Crossbody Bag': 1, 'Backpack': 2, 'Waist Bag': 3, 'Tote Bag': 4,
                'Hiking Backpack': 5, 'Travel Duffel': 6, 'Briefcase': 7, 'Laptop Bag': 8, 'Wallet': 9}
    reverse_item_map = {v: k for k, v in item_map.items()}

    # 使用者特徵
    gender_idx = gender_map[gender]
    status_idx = status_map[status]

    # 建立每個商品對應的輸入特徵
    n_items = len(item_map)
    features = np.zeros((n_items, 2 + n_items))  # (10, 12)
    for i in range(n_items):
        features[i, 0] = gender_idx
        features[i, 1] = status_idx
        features[i, 2 + i] = 1  # 表示這是對第 i 個商品的預測

    # 模型預測
    scores = model.predict(features)

    # 排序並取得 Top-K
    top_indices = np.argsort(scores)[::-1][:top_k]
    recommendations = [(reverse_item_map[i], scores[i]) for i in top_indices]

    return recommendations


# 設定 rating 函數
def set_rating(row, item):
    if item == row['item1']:
        return 0.7
    elif item == row['item2']:
        return 0.3
    return pd.NA

def train_md(data_path='./trainData.xlsx'):
    # 讀取與預處理資料
    df = pd.read_excel(data_path)

    # 重命名欄位
    df = df.rename(columns={
        '性別': 'gender',
        '身分': 'status',
        '最想購買的物品(7分)': 'item1',
        '第二想購買的物品 (3分)': 'item2',
        1: 'user'
    })

    # 只保留需要的欄位
    df = df.drop(columns=['購買理由', '時間戳記'])

    # 所有商品
    all_items = pd.unique(df[['item1', 'item2']].values.ravel())

    # 轉換為長格式資料，並計算評分
    records = []
    for _, row in df.iterrows():
        for item in all_items:
            rating = set_rating(row, item)
            if pd.notna(rating):
                records.append({
                    'user': row['user'],   # 直接使用 'user_id'
                    'gender': row['gender'],
                    'status': row['status'],
                    'item': item,
                    'rating': rating
                })

    df_long = pd.DataFrame(records)

    # 將文字轉為數字
    user_map = {user: idx for idx, user in enumerate(df_long['user'].unique())}
    # item_map = {item: idx for idx, item in enumerate(df_long['item'].unique())}
    item_map = {'Handbag': 0, 'Crossbody Bag': 1, 'Backpack': 2, 'Waist Bag': 3, 'Tote Bag': 4,
                'Hiking Backpack': 5, 'Travel Duffel': 6, 'Briefcase': 7, 'Laptop Bag': 8, 'Wallet': 9}

    df_long['user'] = df_long['user'].map(user_map)
    df_long['item'] = df_long['item'].map(item_map)
    df_long['rating'] = pd.to_numeric(df_long['rating'], errors='coerce')
    df_long = df_long.dropna(subset=['rating'])

    # 切分訓練/測試資料
    train_df, test_df = train_test_split(df_long, test_size=0.2, random_state=42)

    # 確定 user 和 item 的數量
    n_users = len(user_map)
    n_items = len(item_map)

    # 建立訓練集特徵：性別、身分和評分
    # 假設 'gender' 和 'status' 都是類別特徵（可能需要進行 one-hot 編碼）

    # 將 'gender' 和 'status' 轉換為數字
    gender_map = {'m': 0, 'f': 1}  # 假設性別只有男性和女性
    status_map = {'student': 0, 'white_collar': 1, 'blue_collar': 2, 'household': 3, 'elderly': 4}

    train_df['gender'] = train_df['gender'].map(gender_map)
    train_df['status'] = train_df['status'].map(status_map)

    # 訓練集特徵：包含性別、身分與商品評分
    X_train = np.zeros((len(train_df), 2 + n_items))  # 2個特徵: 性別 + 身分 + n_items個商品評分
    for idx, (_, row) in enumerate(train_df.iterrows()):
        X_train[idx, 0] = row['gender']
        X_train[idx, 1] = row['status']
        X_train[idx, 2 + int(row['item'])] = row['rating']  # 這裡將每個商品的評分放在相應的列

    y_train = train_df['rating'].values

    # 建立測試集特徵
    test_df['gender'] = test_df['gender'].map(gender_map)
    test_df['status'] = test_df['status'].map(status_map)

    X_test = np.zeros((len(test_df), 2 + n_items))
    for idx, (_, row) in enumerate(test_df.iterrows()):
        X_test[idx, 0] = row['gender']
        X_test[idx, 1] = row['status']
        X_test[idx, 2 + int(row['item'])] = row['rating']  # 這裡將每個商品的評分放在相應的列

    y_test = test_df['rating'].values

    # 印出確認形狀
    print(f"X_train shape: {X_train.shape}")
    print(f"y_train shape: {y_train.shape}")
    print(f"X_test shape: {X_test.shape}")
    print(f"y_test shape: {y_test.shape}")

    # 訓練 FM 模型
    fm = FMLite()

    if np.isnan(X_train).any():
        print("警告：X_train 中含有 NaN，請檢查資料！")


    fm.fit(X_train, y_train)

    # 儲存模型
    joblib.dump(fm, 'fm_model.pkl')
    print("模型已儲存為 'fm_model.pkl'")

    # 預測
    y_pred = fm.predict(X_test)
    print("預測結果（前 10 筆）：", y_pred[:10])