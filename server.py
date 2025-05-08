from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import render_template
from my_api.ex import exe, fortune_gpt
import random

app = Flask(__name__)
CORS(app)

# 正向且模稜兩可的prompt，並帶入使用者身份與推薦產品資訊
# prompt_templates = [
#     "As a {identity}, you have a unique sense of style that always shines through. A {product} is a wonderful match for your dynamic lifestyle.",
#     "For someone like you ({identity}), a {product} blends functionality with sophistication perfectly.",
#     "Your taste as a {identity} indicates that you appreciate quality and subtle elegance. Consider a {product} to enhance your daily experiences."
# ]
identity_templates = {
     'student': [
         "As a student, using a {product} today brings new energy. Your lucky color is {luckyColor}.",
         "Students like you benefit from {product} — it's your tool for progress. Trust in {luckyColor}.",
         "A {product} may open your path to success. Let {luckyColor} guide your way."
    ],
     'white_collar': [
         "In your career as a white-collar worker, {product} enhances your influence. {luckyColor} is your strength.",
         "Balance and clarity come with {product}. For white-collar professionals, {luckyColor} attracts luck.",
         "Let {product} simplify your day. Your lucky color, {luckyColor}, brings mental sharpness."
     ],
     'blue_collar': [
         "Hard work meets reward — a {product} suits your blue-collar spirit. {luckyColor} brings endurance.",
         "With {product} in hand, stay strong and grounded. {luckyColor} protects your efforts.",
         "Today’s craft deserves focus. Let {product} and {luckyColor} be your allies."
     ],
     'household': [
         "For those tending to home, {product} brings harmony. Your lucky color is {luckyColor}.",
         "Let {product} add ease to your household routine. {luckyColor} nurtures comfort.",
         "As a homemaker, {product} supports your flow. {luckyColor} gives peace."
     ],
     'elderly': [
         "Wisdom walks with you. A {product} may brighten your day. Trust in {luckyColor}.",
         "Comfort and calm arrive with {product}. For the elderly, {luckyColor} offers serenity.",
         "Let {product} bring gentle joy. {luckyColor} is a sign of graceful aging."
     ]
 }


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    # 從前端取得御守、身份以及抽卡選取的圖片路徑
    omamori = data.get('omamori')
    identity = data.get('identity')
    selected_card = data.get('selectedCard')
    luckyColor = data.get('luckyColor')
    print(luckyColor)
    # # 根據身份取得推薦產品，若無對應則使用預設商品
    # recommended_products = product_map.get(identity, ["Universal Bag"])

    # 格式化身份文字（例如將 "white_collar,m" 轉為 "white_collar m"）(範例)
    # identity_readable = identity.replace(",", " ").title()
    status = identity.split(",")[0]
    gender = identity.split(",")[1]
    cardName = selected_card.split('/')[-1].replace('.png', '')
    recommended_products = exe(gender,status)
    print(recommended_products)
    print(cardName)

    
    # 隨機挑選一款產品生成提示語使用(範例)
    product_for_prompt = random.choice(recommended_products)
    print(product_for_prompt)

    # 隨機採用一個提示生成個性化提示語(範例)
    prompt = random.choice(identity_templates.get(identity.split(",")[0], [])).format(luckyColor=luckyColor, product=product_for_prompt)
    # prompt = fortune_gpt(status,product_for_prompt,luckyColor,cardName,omamori)
    return jsonify({
        "omamori": omamori,
        "identity": identity,
        "selectedCard": selected_card,
        "products": recommended_products,
        "prompt": prompt,
        "cardName" : cardName,
        "luckyColor": luckyColor
    })

@app.route('/api/emotional_feedback', methods=['POST'])
def emotional_feedback():
    data = request.get_json()
    
    # 獲取SAM資料
    valence = data.get('valence')
    arousal = data.get('arousal')
    dominance = data.get('dominance')
    omamori = data.get('omamori')
    identity = data.get('identity')

    # 這裡可以保存資料或做其他事(未做

    
    print(f"情緒評估接收: 身份={identity}, 御守={omamori}, 愉悅度={valence}, 喚起度={arousal}, 主導感={dominance}")
    
    # 返回確認訊息
    return jsonify({
        "status": "success",
        "message": "Emotional feedback received successfully",
        "data": {
            "valence": valence,
            "arousal": arousal,
            "dominance": dominance
        }
    })

if __name__ == '__main__':
    app.run(debug=True)
