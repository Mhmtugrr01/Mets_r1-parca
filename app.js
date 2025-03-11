/**
 * app.js 
 * Tüm uygulamayı başlatan ana script
 */

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Gerekli tüm JavaScript dosyalarını yükle
    loadScript('js/compat-check.js')
        .then(() => loadScript('js/mock-firebase.js'))
        .then(() => loadScript('js/firebase-config.js'))
        .then(() => loadScript('js/main.js'))
        .then(() => loadScript('js/auth.js'))
        .then(() => loadScript('js/dashboard.js'))
        .then(() => loadScript('js/orders.js'))
        .then(() => loadScript('js/purchasing.js'))
        .then(() => loadScript('js/production.js'))
        .then(() => loadScript('js/chatbot.js'))
        .then(() => loadScript('js/ai-analytics.js'))
        .then(() => loadScript('js/data-viz.js'))
        .then(() => {
            console.log('Tüm scriptler başarıyla yüklendi');
            
            // Ana uygulamayı başlat
            if (typeof initApp === 'function') {
                initApp();
            } else {
                console.warn('initApp fonksiyonu bulunamadı, demo moda geçiliyor...');
                // Demo modu bildirimi göster
                const demoModeNotification = document.getElementById('demo-mode-notification');
                if (demoModeNotification) {
                    demoModeNotification.style.display = 'block';
                }
                
                // Doğrudan göster
                showMainApp();
                loadDashboardData();
            }
        })
        .catch(error => {
            console.error('Script yükleme hatası:', error);
            
            // Demo moda geçiş yap
            console.warn('Demo moda geçiliyor...');
            enableDemoMode();
        });
});

// JavaScript dosyası ekleme fonksiyonu
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Script yüklenemedi: ${url}`));
        
        document.body.appendChild(script);
    });
}

// Demo modunu etkinleştir
function enableDemoMode() {
    // URL'e demo parametresini ekle
    const currentUrl = new URL(window.location.href);
    if (!currentUrl.searchParams.has('demo')) {
        currentUrl.searchParams.set('demo', 'true');
        window.location.href = currentUrl.toString();
    } else {
        // Hata mesajını kaldır çünkü zaten demo moddayız
        const errorBox = document.getElementById('firebase-error');
        if (errorBox) {
            errorBox.remove();
        }
        
        // Ana uygulamayı göster
        if (typeof showMainApp === 'function') {
            showMainApp();
        } else {
            // showMainApp fonksiyonu yoksa manuel olarak göster
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('register-page').style.display = 'none';
            document.getElementById('forgot-password-page').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
        }
        
        // Dashboard verilerini yükle
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
        
        // Demo modu bildirimi göster
        const demoModeNotification = document.getElementById('demo-mode-notification');
        if (demoModeNotification) {
            demoModeNotification.style.display = 'block';
        }
    }
}
