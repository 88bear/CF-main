from .FM import recommend_for_user,set_rating,train_md
from .fortune_gpt import fortune_gpt
def exe(gender,status):
    # 取得評論
    results = recommend_for_user(gender, status)
    r = []
    for item, score in results:
        r.append((item))
    return r
        # return (f"{status}_{gender} 推薦結果： {item}  預測分數 {score:.4f}")
