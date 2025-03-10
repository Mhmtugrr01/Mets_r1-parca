/**
 * chatbot.js
 * Yapay zeka asistanı işlevleri
 */

// Chatbot penceresini göster/gizle
function toggleChatbot() {
    const chatbotWindow = document.getElementById('chatbot-window');
    if (chatbotWindow.style.display === 'flex') {
        chatbotWindow.style.display = 'none';
    } else {
        chatbotWindow.style.display = 'flex';
        document.getElementById('chatbot-input').focus();
    }
}

// Mesaj gönderme
async function sendChatMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Kullanıcı mesajını ekle
    const chatBody = document.getElementById('chatbot-body');
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'chat-message user';
    userMessageElement.textContent = message;
    chatBody.appendChild(userMessageElement);
    
    // Input'u temizle
    input.value = '';
    
    // Yanıt oluşturma (yapay zeka ile entegrasyon)
    await generateBotResponse(message, chatBody);
    
    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Yapay zeka yanıtı oluşturma
async function generateBotResponse(message, chatBody) {
    // Basit yanıtlar için kontrol (gerçek uygulamada API kullanılabilir)
    let botResponse = '';
    
    try {
        // Yükleniyor göster
        const loadingElement = document.createElement('div');
        loadingElement.className = 'chat-message bot';
        loadingElement.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Yanıt hazırlanıyor...';
        chatBody.appendChild(loadingElement);
        
        // Gerçek API ile entegrasyon burada yapılabilir
        // const response = await callAIService(message);
        
        // Basit yanıt mantığı (gerçek AI yerine)
        if (message.toLowerCase().includes('merhaba') || message.toLowerCase().includes('selam')) {
            botResponse = 'Merhaba! Size nasıl yardımcı olabilirim?';
        } else if (message.toLowerCase().includes('sipariş') && message.toLowerCase().includes('durum')) {
            botResponse = 'Aktif siparişlerinizi kontrol ediyorum... AYEDAŞ siparişi (04-24-1233) üretim aşamasında, BAŞKENT EDAŞ siparişi (04-24-1252) için malzeme tedarik sorunu bulunuyor.';
        } else if (message.toLowerCase().includes('malzeme') || message.toLowerCase().includes('stok')) {
            botResponse = 'Stok durumunu kontrol ediyorum... Kablo başlıkları ve gerilim gösterge malzemelerinde eksiklik var. Satın alma departmanı tedarik işlemlerini yürütüyor.';
        } else if (message.toLowerCase().includes('gecikme') || message.toLowerCase().includes('risk')) {
            botResponse = 'BAŞKENT EDAŞ siparişi (04-24-1252) için kablo başlıkları tedarikinde gecikme riski yüksek. Tedarikçiden gelen bilgilere göre, planlanan teslimat üretim planından daha geç. Alternatif tedarikçilerle iletişime geçmenizi öneririm.';
        } else if (message.toLowerCase().includes('üretim') || message.toLowerCase().includes('plan')) {
            botResponse = 'Mevcut üretim planına göre, Kasım ayında 3 siparişin üretimi devam ediyor. AYEDAŞ siparişi 8 Kasım\'da, BAŞKENT EDAŞ siparişi 15 Kasım\'da, ENERJİSA siparişi 20 Kasım\'da teslim edilecek şekilde planlandı.';
        } else if (message.toLowerCase().includes('öneri') || message.toLowerCase().includes('optimizasyon')) {
            botResponse = 'Kasım ayı siparişleri için üretim optimizasyonu öneriyorum. Benzer hücre tipleri için üretim süreçlerini paralel planlayarak yaklaşık 5 iş günü kazanç sağlayabilirsiniz. Detaylı planı görmek ister misiniz?';
        } else {
            botResponse = 'Özür dilerim, sorunuzu tam olarak anlayamadım. Siparişler, üretim planı, malzeme durumu veya optimizasyon önerileri hakkında bilgi almak için daha açık bir soru sorabilir misiniz?';
        }
        
        // Yükleniyor mesajını kaldır
        chatBody.removeChild(loadingElement);
        
        // Gerçek yanıtı ekle
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'chat-message bot';
        botMessageElement.textContent = botResponse;
        chatBody.appendChild(botMessageElement);
        
    } catch (error) {
        console.error("Chatbot yanıt hatası:", error);
        
        // Hata durumunda
        const errorElement = document.createElement('div');
        errorElement.className = 'chat-message bot';
        errorElement.textContent = 'Üzgünüm, yanıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
        chatBody.appendChild(errorElement);
    }
}

// Enter tuşu ile mesaj gönderme
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatbot-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // Chatbot trigger butonu için tıklama olayı
    const chatbotTrigger = document.querySelector('.chatbot-trigger');
    if (chatbotTrigger) {
        chatbotTrigger.addEventListener('click', toggleChatbot);
    }
    
    // Chatbot kapatma butonu için tıklama olayı
    const chatbotClose = document.querySelector('.chatbot-close');
    if (chatbotClose) {
        chatbotClose.addEventListener('click', toggleChatbot);
    }
});
