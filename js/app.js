/**
 * app.js 
 * Tüm uygulamayı başlatan ana script
 */

// Temel değişkenler
let isDemo = window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1' ||
             window.location.hostname.includes('netlify.app') ||
             window.location.search.includes('demo=true');

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    console.log("ElektroTrack uygulaması başlatılıyor...");
    
    // Mock Firebase'i önce yükle (Demo modda)
    if (isDemo) {
        console.log("Demo mod tespit edildi. Mock Firebase yükleniyor...");
        loadScript('js/mock-firebase.js')
            .then(() => loadMainScripts())
            .catch(error => {
                console.error('Mock Firebase yükleme hatası:', error);
                loadMainScripts();
            });
    } else {
        // Gerçek Firebase'i yükle
        loadMainScripts();
    }
});

// Ana scriptleri yükle
function loadMainScripts() {
    // İlk olarak compat-check yükle
    loadScript('js/compat-check.js')
        .then(() => {
            // Firebase SDK yükle
            return Promise.all([
                loadExternalScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js'),
                loadExternalScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js'),
                loadExternalScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js'),
                loadExternalScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js')
            ]);
        })
        .then(() => loadScript('js/firebase-config.js'))
        .then(() => loadScript('js/main.js'))
        .then(() => loadScript('js/auth.js'))
        .then(() => {
            // Tüm uygulamaya özel scriptleri yükle
            return Promise.all([
                loadScript('js/dashboard.js'),
                loadScript('js/orders.js'),
                loadScript('js/purchasing.js'),
                loadScript('js/production.js'),
                loadScript('js/chatbot.js'),
                loadScript('js/ai-analytics.js'),
                loadScript('js/data-viz.js')
            ]);
        })
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
}

// JavaScript dosyası ekleme fonksiyonu (iç)
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

// Harici JavaScript dosyası ekleme fonksiyonu
function loadExternalScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Harici script yüklenemedi: ${url}`));
        
        document.head.appendChild(script);
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

// Temel yardımcı fonksiyonlar
function showMainApp() {
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const forgotPasswordPage = document.getElementById('forgot-password-page');
    const mainApp = document.getElementById('main-app');
    
    if (loginPage) loginPage.style.display = 'none';
    if (registerPage) registerPage.style.display = 'none';
    if (forgotPasswordPage) forgotPasswordPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
}

// Dashboard verilerini yükle
function loadDashboardData() {
    // Varolan loadDashboardData fonksiyonu yoksa bu dummy fonksiyon kullanılır
    if (typeof window.loadDashboardData === 'function') {
        return window.loadDashboardData();
    }
    
    console.log('Dashboard verileri yükleniyor (demo)...');
}

// Düzgün yüklenemediğinde demo login fonksiyonu
function demoLogin() {
    // Demo kullanıcısı oluştur
    window.currentUser = {
        uid: 'demo-user-1',
        email: 'demo@elektrotrack.com',
        displayName: 'Demo Kullanıcı'
    };
    
    // Ana uygulamayı göster
    showMainApp();
}
