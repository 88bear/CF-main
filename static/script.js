
// 御守抽選圖片的來源
document.querySelectorAll('#omamori-list .omamori-item').forEach(item => {
  item.addEventListener('click', () => {
    // 取消所有御守項目的選取狀態
    document.querySelectorAll('#omamori-list .omamori-item').forEach(el => {
      el.classList.remove('selected');
    });
    
    // 標記被點擊的項目為選取狀態
    item.classList.add('selected');
    
    // 先執行洗牌動畫，然後捲動
    showShuffleAnimation().then(() => {
      document.getElementById('identity-section').scrollIntoView({ behavior: 'smooth' });
    });
  });
});

// 身份選擇邏輯：點選身份後直接捲動到抽卡區，不顯示洗牌動畫
document.querySelectorAll('#identity-list .identity-item').forEach(item => {
  item.addEventListener('click', () => {
    // 取消所有身份項目的選取狀態
    document.querySelectorAll('#identity-list .identity-item').forEach(el => {
      el.classList.remove('selected');
    });
    
    // 標記被點擊的項目為選取狀態
    item.classList.add('selected');
    
    // 先執行洗牌動畫，然後捲動
    showShuffleAnimation().then(() => {
      document.getElementById('identity-section').scrollIntoView({ behavior: 'smooth' });
    });
  });
});

// 洗牌動畫函數
function showShuffleAnimation() {
  return new Promise((resolve) => {
    const shuffleContainer = document.getElementById('card-shuffle-container');
    shuffleContainer.classList.remove('hidden');
    
    // 添加多副牌的動畫效果
    const cardDeck = document.querySelector('.card-deck');
    
    // 創建一些額外的牌，模擬洗牌效果
    for (let i = 0; i < 5; i++) {
      const extraCard = document.createElement('div');
      extraCard.className = 'card-deck';
      extraCard.style.animationDelay = `${i * 0.2}s`;
      extraCard.style.zIndex = 10 - i;
      shuffleContainer.querySelector('.shuffle-animation').appendChild(extraCard);
    }
    
    // 設定動畫時間（3秒）
    setTimeout(() => {
      shuffleContainer.classList.add('hidden');
      // 清理創建的額外卡牌
      const extraCards = document.querySelectorAll('.card-deck');
      extraCards.forEach((card, index) => {
        if (index > 0) { // 保留原始的卡牌元素
          card.remove();
        }
      });
      resolve();
    }, 2000);
  });
}

// 抽卡用的圖片來源（cards 資料夾，從22張中隨機選1張）
const cardImages = [
  '/static/images/cards/00_the_Fool.png','/static/images/cards/01_the_Magician.png', '/static/images/cards/02_The_High_Priestess.png',
  '/static/images/cards/03_The_Empress.png','/static/images/cards/04_The_Emperor.png', '/static/images/cards/05_The_Hierophant.png',
  '/static/images/cards/06_The_Lovers.png','/static/images/cards/07_The_Chariot.png', '/static/images/cards/08_The_Strength.png',
  '/static/images/cards/09_The_Hermit.png','/static/images/cards/10_Wheel_of_Fortune.png', '/static/images/cards/11_Justice.png',
  '/static/images/cards/12_The_Hanged_Man.png','/static/images/cards/13_The_Death.png', '/static/images/cards/14_Temperance.png',
  '/static/images/cards/15_The_Devil.png','/static/images/cards/16_The_Tower.png', '/static/images/cards/17_The_Star.png',
  '/static/images/cards/18_The_Moon.png','/static/images/cards/19_The_Sun.png', '/static/images/cards/20_Judgement.png',
  '/static/images/cards/21_The_World.png'
];

// 顏色列表，可以根據需求自行調整
const colors = ['white', 'brown', 'green', 'light green', 'pink', 'purple', 'red', 'turquoise', 'yellow', 'blue'];

// 顯示說明彈窗，並加上關閉功能
window.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('intro-modal');
  const closeBtn = document.getElementById('close-modal');

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // 點擊外部區域也可關閉
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});


// 抽卡功能：點選抽卡按鈕後顯示洗牌動畫，再顯示一張隨機選中的卡片
document.getElementById('draw-cards').addEventListener('click', () => {

  // 先顯示洗牌動畫
  showShuffleAnimation().then(() => {
    const cardResultDiv = document.getElementById('card-result');
    cardResultDiv.innerHTML = ""; // 清除先前的結果
    
    // 隨機選取一張卡片
    const randomIndex = Math.floor(Math.random() * cardImages.length);
    const randomCard = cardImages[randomIndex];
    
    // 顯示卡片
    const img = document.createElement('img');
    img.src = randomCard;
    img.alt = 'Selected Card';
    img.classList.add('selected'); // 自動標記為已選中

    // 確保圖片完全載入後再顯示
    img.onload = function() {
      // 加載完成時可以添加特效
      img.style.animation = 'fadeIn 0.5s ease-in';
    };
    
    cardResultDiv.appendChild(img);


    // 隨機抽取 luckyColor
    const luckyColor = colors[Math.floor(Math.random() * colors.length)]; // 儲存 luckyColor
    cardResultDiv.setAttribute('data-lucky-color', luckyColor);
    
    // 自動捲動到提交區
    document.getElementById('submit-section').scrollIntoView({ behavior: 'smooth' });
  });
});

// 提交資料並產生推薦
document.getElementById('submit').addEventListener('click', () => {
  // get被選的御守
  const omamoriElement = document.querySelector('#omamori-list .omamori-item.selected');
  if (!omamoriElement) {
    alert('請先選擇一個御守！');
    return;
  }
  const omamori = omamoriElement.dataset.value;

  // get被選的身份
  const identityElement = document.querySelector('#identity-list .identity-item.selected');
  if (!identityElement) {
    alert('請選擇身份！');
    return;
  }
  const identity = identityElement.dataset.value;

  // get被選的卡片
  const selectedCard = document.querySelector('#card-result img');
  if (!selectedCard) {
    alert('請先抽取卡片！');
    return;
  }

  // 要送出的data，這裡可以把 luckyColor 加入
  //const luckyColor 
  const data = {
    omamori,
    identity,
    selectedCard: selectedCard.src,
    luckyColor: document.getElementById('card-result').getAttribute('data-lucky-color')// 這裡是傳遞 luckyColor
  };

  fetch('http://127.0.0.1:5000/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      // 將推薦結果顯示在結果區域
      //document.getElementById('result').innerText =
        //`Recommended Products: ${result.products.join(', ')}\n\nPrompt: ${result.prompt}`;
      //將抽到的卡片與推薦文結果顯示再結果區
      generateImage(`tarot <lora:Tarotv0.2:1> ${result.prompt}`, result.luckyColor).then(() => {
        document.getElementById('result').innerText =
          `Your Card: ${result.cardName}\nLucky color: ${result.luckyColor}\nDaily fortune: ${result.prompt}`;
          // 自動捲動到推薦結果區
        document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          // 顯示SAM情緒評估區域
          document.getElementById('sam-section').classList.remove('hidden');
          document.getElementById('sam-section').scrollIntoView({ behavior: 'smooth' })
        }, 5000);

      });
        
    })
    .catch(error => console.error('Error:', error));
});

// SAM
['valence', 'arousal', 'dominance'].forEach((dimension, index) => {
  document.querySelectorAll(`#${dimension}-options .sam-option`).forEach(option => {
    option.addEventListener('click', () => {
      // 取消其他選項的選中狀態
      document.querySelectorAll(`#${dimension}-options .sam-option`).forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // 被點擊的選項為選中狀態
      option.classList.add('selected');
      
      // 自動捲動
      if(index < 2){ 
        const nextDimension = ['valence', 'arousal', 'dominance'][index + 1];
        document.querySelector(`.sam-dimension:nth-child(${index + 2})`).scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'  // 確保捲動後的元素置中
        });
      }else{
        // 捲動到提交按鈕
        document.getElementById('submit-sam').scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  });
});

// 提交情緒評估
document.getElementById('submit-sam').addEventListener('click', () => {
  // 獲取選中的值
  const valenceOption = document.querySelector('#valence-options .sam-option.selected');
  const arousalOption = document.querySelector('#arousal-options .sam-option.selected');
  const dominanceOption = document.querySelector('#dominance-options .sam-option.selected');
  
  // 驗證是否所有維度都已選擇
  if (!valenceOption || !arousalOption || !dominanceOption) {
    alert('請在每個維度中選擇一個選項！');
    return;
  }
  
  // 準備要送出的情緒評估資料
  const samData = {
    valence: parseInt(valenceOption.dataset.value),
    arousal: parseInt(arousalOption.dataset.value),
    dominance: parseInt(dominanceOption.dataset.value),
    // 可以添加先前已提交的資訊，便於後端整合數據
    omamori: document.querySelector('#omamori-list .omamori-item.selected').dataset.value,
    identity: document.querySelector('#identity-list .identity-item.selected').dataset.value
  };
  
  // 發送情緒評估資料到後端（可以新建一個端點或與現有端點整合）
  fetch('http://127.0.0.1:5000/api/emotional_feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(samData)
  })
    .then(response => response.json())
    .then(result => {
      alert('感謝您的情緒評估提交！');
      // 完成所有流程
      document.getElementById('sam-section').innerHTML += `
        <div class="completion-message">
          <h3>謝謝您的參與！</h3>
          <p>您的選擇和情緒評估已成功記錄。</p>
        </div>
      `;
    })
    .catch(error => {
      console.error('Error submitting emotional feedback:', error);
      alert('提交情緒評估時發生錯誤，請稍後再試。');
    });
});