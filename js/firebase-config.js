/**
 * firebase-config.js
 * Firebase yapılandırma ve başlatma
 */

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyAFQdnF6RGFuQmrtjB3rCo_fkoQNk0QPJ4",
    authDomain: "mehmentendustriyeltakip.firebaseapp.com",
    projectId: "mehmentendustriyeltakip",
    storageBucket: "mehmentendustriyeltakip.appspot.com",
    messagingSenderId: "100391457932",
    appId: "1:100391457932:web:0fe2f9aab2835220a56466",
    measurementId: "G-L4TMML2WR2"
};

// Demo modu kontrolü
const isDemoMode = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('netlify.app') ||
                   window.location.search.includes('demo=true');

// Firebase bileşenlerini başlat
let app, auth, db, analytics;

// Firebase'i başlat
function initializeFirebase() {
    return new Promise((resolve, reject) => {
        try {
            // Firebase tanımlı mı kontrol et
            if (typeof firebase === 'undefined') {
                console.error('Firebase SDK yüklenemedi. Demo moda geçiliyor...');
                enableDemoMode();
                resolve(false);
                return;
            }
            
            // Firebase uygulamasını başlat
            if (!firebase.apps.length) {
                try {
                    app = firebase.initializeApp(firebaseConfig);
                    console.log("Firebase başlatıldı");
                } catch (initError) {
                    console.warn("Firebase başlatılamadı, demo moda geçiliyor", initError);
                    enableDemoMode();
                    resolve(false);
                    return;
                }
            } else {
                app = firebase.app();
            }
            
            // Firebase servislerini al
            try {
                auth = firebase.auth();
                db = firebase.firestore();
                analytics = firebase.analytics ? firebase.analytics() : null;
                console.log("Firebase servisleri başarıyla alındı");
            } catch (serviceError) {
                console.warn("Firebase servisleri alınamadı, demo moda geçiliyor", serviceError);
                enableDemoMode();
                resolve(false);
                return;
            }
            
            // Demo modda olduğumuzu kontrol et
            if (isDemoMode) {
                console.log("Demo modu aktif");
                // Demo bildirimini göster
                setTimeout(() => {
                    const demoModeNotification = document.getElementById('demo-mode-notification');
                    if (demoModeNotification) {
                        demoModeNotification.style.display = 'block';
                    }
                }, 2000);
            }
            
            // Global erişim için window nesnesine atama
            window.firebase = firebase;
            window.auth = auth;
            window.db = db;
            window.analytics = analytics;
            
            console.log("Firebase başarıyla başlatıldı" + (isDemoMode ? " (Demo Mod)" : ""));
            resolve(true);
        } catch (error) {
            console.error("Firebase başlatma hatası:", error);
            enableDemoMode();
            resolve(false);
        }
    });
}

// Demo modunu etkinleştir
function enableDemoMode() {
    console.log("Demo modu etkinleştiriliyor...");
    
    // URL'e demo parametresini ekle
    const currentUrl = new URL(window.location.href);
    if (!currentUrl.searchParams.has('demo')) {
        currentUrl.searchParams.set('demo', 'true');
        
        // Sayfa yeniden yüklemesi olmadan URL'i güncelle
        window.history.replaceState({}, document.title, currentUrl.toString());
    }
    
    // Demo modu bildirimi göster
    setTimeout(() => {
        const demoModeNotification = document.getElementById('demo-mode-notification');
        if (demoModeNotification) {
            demoModeNotification.style.display = 'block';
        }
    }, 1000);
}

// DOMContentLoaded olayı için dinleyici
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Firebase'i başlatmayı dene
        const firebaseInitialized = await initializeFirebase();
        
        // Uygulama başlatma
        if (typeof initApp === 'function') {
            initApp();
        } else {
            console.warn("initApp fonksiyonu bulunamadı.");
            
            // Doğrudan ana uygulamayı göster (demo modu)
            if (isDemoMode) {
                if (typeof showMainApp === 'function') {
                    showMainApp();
                }
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
            }
        }
    } catch (error) {
        console.error("Uygulama başlatma hatası:", error);
        enableDemoMode();
    }
});

// Firebase erişilemezse ya da hata oluşursa demo moda geçiş için timeout
setTimeout(() => {
    // Hala login sayfasındaysak ve demo modunda değilsek
    if (document.getElementById('login-page') && 
        document.getElementById('login-page').style.display !== 'none' && 
        !window.location.search.includes('demo=true')) {
        console.warn("Firebase bağlantı zaman aşımı, demo moduna geçiliyor");
        enableDemoMode();
        
        // Demo kullanıcısıyla otomatik giriş yap
        if (typeof demoLogin === 'function') {
            demoLogin();
        }
    }
}, 5000);
