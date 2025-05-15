async function generateImage(prompt, luckyColor) {
  const status      = document.getElementById("status");
  const resultImage = document.getElementById("resultImage");

  status.textContent = "生成中，請稍候…";
  resultImage.src = "";

  try {
    /* 1. 讀取 luckyColor 對應包包圖 → base64 */
    const blob = await fetch(`/static/images/bag/${luckyColor}.jpg`).then(r => r.blob());
    const base64 = await new Promise((ok, no) => {
      const fr = new FileReader();
      fr.onloadend = () => ok(fr.result.split(",")[1]);
      fr.onerror   = no;
      fr.readAsDataURL(blob);
    });

    /* 2. 組裝 payload */
    const payload = {
    prompt,                               // ★ 不再硬寫 turquoise
    negative_prompt:
      "monochrome, wrong color, low contrast, watermark",
    steps: 25,
    cfg_scale: 10,
    width: 512,
    height: 512,
    alwayson_scripts: {
      controlnet: {
        args: [
          {
            image: base64,
            module: "reference_only",
            model: "control_v11p_sd15_reference.safetensors",
            weight: 0.4,
            control_mode: "My prompt is more important",
            resize_mode: "Just Resize",
            processor_res: 512
          }
        ]
      }
    }
  };

    /* 3. 呼叫 SD API */
    const resp = await fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload)
    });

    if (!resp.ok) {
      console.error("HTTP", resp.status, await resp.text());
      throw new Error("SD API error " + resp.status);
    }

    const data = await resp.json();
    const img64 = data.images?.[0];
    if (!img64) throw new Error("API 回傳缺少 images 欄位");

    resultImage.onload  = () => status.textContent = "✅ 圖片生成完成！";
    resultImage.onerror = () => status.textContent = "❌ 圖片載入失敗";
    resultImage.src     = "data:image/png;base64," + img64;

  } catch (err) {
    console.error(err);
    status.textContent = "❌ 發生錯誤，詳見 Console";
  }
}
