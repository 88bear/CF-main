import openai
from dotenv import load_dotenv
import os
def fortune_gpt(identity,product,luckyColor,tarotcard,omamori):
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    client = openai.OpenAI(api_key=api_key)

    # identity = "student"
    # product = "laptop"
    # luckyColor = "blue"
    # tarotcard = "The Magician"
    # omamori = "kenkou"
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
            {
                "role": "system",
                "content": (
                    "Write a short (≤25 words) tarot fortune. Let omamori influence the theme, "
                    "identity shape the tone. Do not mention them directly. Use product, color, card, must mention them."
                )
            },
            {
                "role": "user",
                "content": f"identity: {identity}, product: {product}, color: {luckyColor}, omamori: {omamori}, card: {tarotcard}"
            }
            ],
            max_tokens=50,
            temperature=0.7
        )
        generated_text = response.choices[0].message.content.strip()
        print(generated_text)

        # 取出 token 使用資訊
        prompt_tokens = response.usage.prompt_tokens
        completion_tokens = response.usage.completion_tokens
        total_tokens = response.usage.total_tokens
        print(f" Tokens used — Prompt: {prompt_tokens}, Completion: {completion_tokens}, Total: {total_tokens}")

        return generated_text
    except:
        return "error"