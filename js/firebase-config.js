// firebase-config.js
// Firebase yapılandırma ve başlatma

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyAFQdnF6RGFuQmrtjB3rCo_fkoQNk0QPJ4",
    authDomain: "mehmentendustriyeltakip.firebaseapp.com",
    projectId: "mehmentendustriyeltakip",
    storageBucket: "mehmentendustriyeltakip.filebaseapp.com",
    messagingSenderId: "100391457932",
    appId: "1:100391457932:web:0fe2f9aab2835220a56466",
    measurementId: "G-L4TMML2WR2"
};

// Demo modu kontrolü
const isDemo = window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('netlify.app') ||
               window.location.search.includes('demo=true');

// Firebase bileşenlerini başlat
let app, auth, db, analytics;

// Firebase'i başlat
function initializeFirebase() {
    return new Promise((resolve, reject) => {
        try {
            // Firebase'in yüklenip yüklenmediğini kontrol et
            if (typeof firebase === 'undefined') {
                console.error("Firebase SDK yüklenemedi");
                
                // Demo modda zaten mock-firebase.js bu hatayı ele alacak
                if (!isDemo) {
                    showFirebaseError("Firebase SDK yüklenemedi. İnternet bağlantınızı kontrol edin ve sayfayı yenileyin.");
                }
                
                reject(new Error("Firebase SDK yüklenemedi"));
                return;
            }
            
            // Firebase uygulamasını başlat
            if (!firebase.apps.length) {
                app = firebase.initializeApp(firebaseConfig);
            } else {
                app = firebase.app();
            }
            
            // Firebase servislerini al
            auth = firebase.auth();
            db = firebase.firestore();
            analytics = firebase.analytics ? firebase.analytics() : null;
            
            // Demo modda olduğumuzu kontrol et
            checkDemoMode();
            
            // Global erişim için window nesnesine atama
            window.auth = auth;
            window.db = db;
            
            // Helper fonksiyonlarla firebase nesnesini genişlet
            extendFirebase();
            
            console.log("Firebase başarıyla başlatıldı" + (isDemo ? " (Demo Mod)" : ""));
            resolve(true);
        } catch (error) {
            console.error("Firebase başlatma hatası:", error);
            
            if (!isDemo) {
                showFirebaseError("Firebase başlatılamadı: " + error.message);
            }
            
            reject(error);
        }
    });
}

// Demo modu kontrolü
function checkDemoMode() {
    if (isDemo) {
        console.log("Demo modu aktif");
        
        // Demo kullanıcısıyla otomatik giriş yap
        if (!auth.currentUser) {
            setTimeout(() => {
                try {
                    // Otomatik demo kullanıcısıyla giriş yap
                    auth.signInWithEmailAndPassword('demo@elektrotrack.com', 'demo123')
                        .then(() => {
                            console.log("Demo kullanıcısıyla otomatik giriş yapıldı");
                            
                            // Demo modu bildirimini göster
                            const demoModeNotification = document.getElementById('demo-mode-notification');
                            if (demoModeNotification) {
                                demoModeNotification.style.display = 'block';
                            }
                        })
                        .catch(error => {
                            console.warn("Demo kullanıcısıyla otomatik giriş yapılamadı:", error);
                        });
                } catch (error) {
                    console.warn("Demo modu otomatik giriş hatası:", error);
                }
            }, 2000);
        }
    }
}

// Firebase helper fonksiyonlarını ekle
function extendFirebase() {
    window.firebase = {
        ...firebase,
        app: app,
        auth: auth,
        db: db,
        analytics: analytics,
        
        // Helper fonksiyonlar
        signInWithEmailAndPassword: (email, password) => 
            auth.signInWithEmailAndPassword(email, password),
        createUserWithEmailAndPassword: (email, password) => 
            auth.createUserWithEmailAndPassword(email, password),
        sendPasswordResetEmail: (email) => 
            auth.sendPasswordResetEmail(email),
        signOut: () => 
            auth.signOut(),
        collection: (path) => 
            db.collection(path),
        doc: (collection, docId) => 
            docId ? db.collection(collection).doc(docId) : db.doc(collection),
        setDoc: (docRef, data) => 
            docRef.set(data),
        getDoc: (docRef) => 
            docRef.get(),
        getDocs: (query) => 
            query.get(),
        query: (collRef) => 
            collRef,
        where: (field, op, value) => 
            firebase.firestore.where(field, op, value),
        serverTimestamp: () => 
            firebase.firestore.FieldValue.serverTimestamp(),
        arrayUnion: (...elements) => 
            firebase.firestore.FieldValue.arrayUnion(...elements),
        increment: (n) => 
            firebase.firestore.FieldValue.increment(n)
    };
}

// Firebase hata mesajını göster
function showFirebaseError(message) {
    // Sayfa yüklendiyse hata mesajı göster
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // Var olan hata kutusu varsa sil
        const existingError = document.getElementById('firebase-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Yeni hata kutusu oluştur
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
        
        // Demo moda geçiş butonu da ekle
        errorBox.innerHTML = `
            <div>${message}</div>
            <div style="margin-top:8px;">
                <button onclick="location.reload()" style="margin-right:8px;padding:5px 10px;background:#dc3545;color:white;border:none;border-radius:4px;cursor:pointer;">Sayfayı Yenile</button>
                <button onclick="location.href=location.href+'?demo=true'" style="padding:5px 10px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;">Demo Modunda Çalıştır</button>
            </div>
        `;
        
        document.body.prepend(errorBox);
    } else {
        // Sayfa yüklenmedi, event listener ekle
        window.addEventListener('DOMContentLoaded', () => {
            showFirebaseError(message);
        });
    }
}

// Firebase SDK'ları yüklendikten sonra çağrılacak
function initializeFirebaseWhenReady() {
    if (document.readyState === 'complete') {
        return initializeFirebase();
    }

    return new Promise((resolve) => {
        window.addEventListener('load', () => {
            initializeFirebase().then(resolve);
        });
    });
}

// DOMContentLoaded olayı için dinleyici ekle
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await initializeFirebaseWhenReady();
        console.log("Firebase hazır, uygulama başlatılıyor");
        
        // İlgili uygulamanın başlatılması
        if (typeof initApp === 'function') {
            initApp();
        }
    } catch (error) {
        console.error("Uygulama başlatma hatası:", error);
    }
});
