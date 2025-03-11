/*
  BU DOSYA, kod-1 ve kod-2'yi BİRLEŞTİRİR.
  "Kapsam azaltma olmasın" talebine uygun biçimde
  tüm fonksiyonları ve satırları, olası çakışmaları
  ufak değişikliklerle saklar.

  Artık kod-1'den de, kod-2'den de gelen tüm özellikler
  tek bir dosyada bulunuyor.
*/

/**************************************
 * BÖLÜM A: KOD-1'DEKİ İÇERİK
 **************************************/

// firebase-config-KOD1.js
// Firebase yapılandırma ve başlatma (kod-1)

// Firebase yapılandırması (kod-1)
const firebaseConfigKOD1 = {
    apiKey: "AIzaSyAFQdnF6RGFuQmrtjB3rCo_fkoQNk0QPJ4",
    authDomain: "mehmentendustriyeltakip.firebaseapp.com",
    projectId: "mehmentendustriyeltakip",
    storageBucket: "mehmentendustriyeltakip.appspot.com", // düzeltildi (kod-1)
    messagingSenderId: "100391457932",
    appId: "1:100391457932:web:0fe2f9aab2835220a56466",
    measurementId: "G-L4TMML2WR2"
};

// Demo modu kontrolü - URL'de demo=true parametresi varsa veya Netlify'da çalışıyorsa demo modunu etkinleştir (kod-1)
const isDemoKOD1 = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('netlify.app') ||
                   window.location.search.includes('demo=true');

// Firebase bileşenlerini başlat (kod-1)
let appKOD1, authKOD1, dbKOD1, analyticsKOD1;

// Firebase'i başlat (kod-1)
function initializeFirebaseKOD1() {
    return new Promise((resolve, reject) => {
        try {
            // Firebase'in yüklenip yüklenmediğini kontrol et
            if (typeof firebase === 'undefined') {
                console.warn("Firebase SDK yüklenemedi, demo moda geçiliyor (kod-1)");
                enableDemoModeKOD1();
                resolve(false);
                return;
            }
            
            // Firebase uygulamasını başlat
            if (!firebase.apps.length) {
                try {
                    appKOD1 = firebase.initializeApp(firebaseConfigKOD1);
                    console.log("(kod-1) Firebase başlatıldı");
                } catch (initError) {
                    console.warn("(kod-1) Firebase başlatılamadı, demo moda geçiliyor", initError);
                    enableDemoModeKOD1();
                    resolve(false);
                    return;
                }
            } else {
                appKOD1 = firebase.app();
            }
            
            // Firebase servislerini al
            try {
                authKOD1 = firebase.auth();
                dbKOD1 = firebase.firestore();
                analyticsKOD1 = firebase.analytics ? firebase.analytics() : null;
                console.log("(kod-1) Firebase servisleri başarıyla alındı");
            } catch (serviceError) {
                console.warn("(kod-1) Firebase servisleri alınamadı, demo moda geçiliyor", serviceError);
                enableDemoModeKOD1();
                resolve(false);
                return;
            }
            
            // Demo modda olduğumuzu kontrol et
            checkDemoModeKOD1();
            
            // Global erişim için window nesnesine atama
            window.authKOD1 = authKOD1;
            window.dbKOD1 = dbKOD1;
            
            console.log("(kod-1) Firebase başarıyla başlatıldı" + (isDemoKOD1 ? " (Demo Mod)" : ""));
            resolve(true);
        } catch (error) {
            console.error("(kod-1) Firebase başlatma hatası:", error);
            enableDemoModeKOD1();
            resolve(false);
        }
    });
}

// Demo modu kontrolü (kod-1)
function checkDemoModeKOD1() {
    if (isDemoKOD1) {
        console.log("(kod-1) Demo modu aktif");
        // Demo bildirimini göster
        setTimeout(() => {
            const demoModeNotification = document.getElementById('demo-mode-notification');
            if (demoModeNotification) {
                demoModeNotification.style.display = 'block';
            }
        }, 2000);
    }
}

// Demo modunu etkinleştir (kod-1)
function enableDemoModeKOD1() {
    console.log("(kod-1) Demo modu etkinleştiriliyor...");
    // URL'e demo parametresini ekle (zaten yoksa)
    const currentUrl = new URL(window.location.href);
    if (!currentUrl.searchParams.has('demo')) {
        currentUrl.searchParams.set('demo', 'true');
        // Sadece geçmiş girişini değiştir, sayfayı yeniden yükleme
        window.history.replaceState({}, document.title, currentUrl.toString());
    }
    
    // Demo bildirimini göster
    setTimeout(() => {
        const demoModeNotification = document.getElementById('demo-mode-notification');
        if (demoModeNotification) {
            demoModeNotification.style.display = 'block';
        }
    }, 2000);
}

// DOMContentLoaded olayı için dinleyici (kod-1)
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Önce mock-firebase.js'in yüklenip yüklenmediğini kontrol et
        if (window.firebase && window.firebase._firestoreInstance) {
            console.log("(kod-1) Mock Firebase zaten yüklenmiş, doğrudan demo moda geçiliyor");
            enableDemoModeKOD1();
            // initApp fonksiyonu varsa çalıştır
            if (typeof initApp === 'function') {
                initApp();
            }
            return;
        }
        
        // Firebase'i başlatmayı dene
        const firebaseInitialized = await initializeFirebaseKOD1();
        
        // Uygulama başlatma
        if (typeof initApp === 'function') {
            initApp();
        } else {
            console.warn("(kod-1) initApp fonksiyonu bulunamadı.");
            // Doğrudan ana uygulamayı göster (demo modu)
            if (isDemoKOD1) {
                if (typeof showMainApp === 'function') {
                    showMainApp();
                }
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
            }
        }
    } catch (error) {
        console.error("(kod-1) Uygulama başlatma hatası:", error);
        enableDemoModeKOD1();
    }
});

// Firebase erişilemezse ya da hata oluşursa demo moda geçiş için timeout (kod-1)
setTimeout(() => {
    // Hala login sayfasındaysak ve demo modunda değilsek
    if (document.getElementById('login-page') && 
        document.getElementById('login-page').style.display !== 'none' && 
        !window.location.search.includes('demo=true')) {
        console.warn("(kod-1) Firebase bağlantı zaman aşımı, demo moduna geçiliyor");
        enableDemoModeKOD1();
        // Demo kullanıcısıyla otomatik giriş yap
        if (typeof demoLogin === 'function') {
            demoLogin();
        }
    }
}, 5000);


/**************************************
 * BÖLÜM B: KOD-2'DEKİ İÇERİK
 **************************************/

// firebase-config-KOD2.js
// Firebase yapılandırma ve başlatma (kod-2)

// Firebase yapılandırması (kod-2)
const firebaseConfigKOD2 = {
    apiKey: "AIzaSyAFQdnF6RGFuQmrtjB3rCo_fkoQNk0QPJ4",
    authDomain: "mehmentendustriyeltakip.firebaseapp.com",
    projectId: "mehmentendustriyeltakip",
    storageBucket: "mehmentendustriyeltakip.filebaseapp.com", // kod-2 versiyon
    messagingSenderId: "100391457932",
    appId: "1:100391457932:web:0fe2f9aab2835220a56466",
    measurementId: "G-L4TMML2WR2"
};

// Demo modu kontrolü (kod-2)
const isDemoKOD2 = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('netlify.app') ||
                   window.location.search.includes('demo=true');

let appKOD2, authKOD2, dbKOD2, analyticsKOD2;

function initializeFirebaseKOD2() {
    return new Promise((resolve, reject) => {
        try {
            if (typeof firebase === 'undefined') {
                console.error("(kod-2) Firebase SDK yüklenemedi");

                // Demo modda mock-firebase.js bu hatayı ele alacak
                if (!isDemoKOD2) {
                    showFirebaseErrorKOD2("(kod-2) Firebase SDK yüklenemedi. İnternet bağlantınızı kontrol edin ve sayfayı yenileyin.");
                }
                reject(new Error("(kod-2) Firebase SDK yüklenemedi"));
                return;
            }

            // Firebase uygulaması
            if (!firebase.apps.length) {
                appKOD2 = firebase.initializeApp(firebaseConfigKOD2);
            } else {
                appKOD2 = firebase.app();
            }

            authKOD2 = firebase.auth();
            dbKOD2 = firebase.firestore();
            analyticsKOD2 = firebase.analytics ? firebase.analytics() : null;

            // Demo modu kontrol
            checkDemoModeKOD2();

            // Global erişim ataması
            window.authKOD2 = authKOD2;
            window.dbKOD2 = dbKOD2;

            // Helper fonksiyonlarla firebase nesnesini genişlet
            extendFirebaseKOD2();

            console.log("(kod-2) Firebase başarıyla başlatıldı" + (isDemoKOD2 ? " (Demo Mod)" : ""));
            resolve(true);
        } catch (error) {
            console.error("(kod-2) Firebase başlatma hatası:", error);
            if (!isDemoKOD2) {
                showFirebaseErrorKOD2("(kod-2) Firebase başlatılamadı: " + error.message);
            }
            reject(error);
        }
    });
}

function checkDemoModeKOD2() {
    if (isDemoKOD2) {
        console.log("(kod-2) Demo modu aktif");

        // Demo kullanıcısıyla otomatik giriş yap
        if (!authKOD2.currentUser) {
            setTimeout(() => {
                try {
                    authKOD2.signInWithEmailAndPassword('demo@elektrotrack.com', 'demo123')
                        .then(() => {
                            console.log("(kod-2) Demo kullanıcısıyla otomatik giriş yapıldı");
                            const demoModeNotification = document.getElementById('demo-mode-notification');
                            if (demoModeNotification) {
                                demoModeNotification.style.display = 'block';
                            }
                        })
                        .catch(error => {
                            console.warn("(kod-2) Demo kullanıcısıyla otomatik giriş yapılamadı:", error);
                        });
                } catch (error) {
                    console.warn("(kod-2) Demo modu otomatik giriş hatası:", error);
                }
            }, 2000);
        }
    }
}

function extendFirebaseKOD2() {
    window.firebaseKOD2 = {
        ...firebase,
        app: appKOD2,
        auth: authKOD2,
        db: dbKOD2,
        analytics: analyticsKOD2,

        // Helper fonksiyonlar
        signInWithEmailAndPassword: (email, password) => authKOD2.signInWithEmailAndPassword(email, password),
        createUserWithEmailAndPassword: (email, password) => authKOD2.createUserWithEmailAndPassword(email, password),
        sendPasswordResetEmail: (email) => authKOD2.sendPasswordResetEmail(email),
        signOut: () => authKOD2.signOut(),
        collection: (path) => dbKOD2.collection(path),
        doc: (collection, docId) => docId ? dbKOD2.collection(collection).doc(docId) : dbKOD2.doc(collection),
        setDoc: (docRef, data) => docRef.set(data),
        getDoc: (docRef) => docRef.get(),
        getDocs: (query) => query.get(),
        query: (collRef) => collRef,
        where: (field, op, value) => firebase.firestore.where(field, op, value),
        serverTimestamp: () => firebase.firestore.FieldValue.serverTimestamp(),
        arrayUnion: (...elements) => firebase.firestore.FieldValue.arrayUnion(...elements),
        increment: (n) => firebase.firestore.FieldValue.increment(n)
    };
}

function showFirebaseErrorKOD2(message) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        const existingError = document.getElementById('firebase-error');
        if (existingError) {
            existingError.remove();
        }

        const errorBox = document.createElement('div');
        errorBox.id = 'firebase-error';
        errorBox.style.position = 'fixed';
        errorBox.style.top = '0';
        errorBox.style.left = '0';
        errorBox.style.right = '0';
        errorBox.style.backgroundColor = '#f8d7da';
        errorBox.style.color = '#721c24';
        errorBox.style.padding = '12px';
        errorBox.style.textAlign = 'center';
        errorBox.style.zIndex = '9999';
        errorBox.style.fontWeight = 'bold';

        errorBox.innerHTML = `
            <div>${message}</div>
            <div style="margin-top:8px;">
                <button onclick="location.reload()" style="margin-right:8px;padding:5px 10px;background:#dc3545;color:white;border:none;border-radius:4px;cursor:pointer;">Sayfayı Yenile</button>
                <button onclick="location.href=location.href+'?demo=true'" style="padding:5px 10px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;">Demo Modunda Çalıştır</button>
            </div>
        `;
        document.body.prepend(errorBox);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            showFirebaseErrorKOD2(message);
        });
    }
}

function initializeFirebaseWhenReadyKOD2() {
    if (document.readyState === 'complete') {
        return initializeFirebaseKOD2();
    }
    return new Promise((resolve) => {
        window.addEventListener('load', () => {
            initializeFirebaseKOD2().then(resolve);
        });
    });
}

// DOMContentLoaded olayı (kod-2)
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await initializeFirebaseWhenReadyKOD2();
        console.log("(kod-2) Firebase hazır, uygulama başlatılıyor");

        if (typeof initApp === 'function') {
            initApp();
        }
    } catch (error) {
        console.error("(kod-2) Uygulama başlatma hatası:", error);
    }
});
