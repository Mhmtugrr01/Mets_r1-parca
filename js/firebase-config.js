// firebase-config.js
// Firebase yapılandırma ve başlatma

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyAFQdnF6RGFuQmrtjB3rCo_fkoQNk0QPJ4",
    authDomain: "mehmentendustriyeltakip.firebaseapp.com",
    projectId: "mehmentendustriyeltakip",
    storageBucket: "mehmentendustriyeltakip.firebaseapp.com",
    messagingSenderId: "100391457932",
    appId: "1:100391457932:web:0fe2f9aab2835220a56466",
    measurementId: "G-L4TMML2WR2"
};

// Firebase uygulamasını başlat
let firebaseApp;
let auth;
let db;
let analytics;

// Firebase bileşenlerini başlat
function initializeFirebase() {
    // Firebase SDK'ları yüklendikten sonra çağrılacak
    return new Promise((resolve, reject) => {
        try {
            // Firebase yüklendiğini kontrol et
            if (typeof firebase === 'undefined') {
                console.error("Firebase SDK yüklenemedi");
                reject(new Error("Firebase SDK yüklenemedi"));
                return;
            }

            // Firebase'i başlat
            if (!firebase.apps.length) {
                firebaseApp = firebase.initializeApp(firebaseConfig);
            } else {
                firebaseApp = firebase.app();
            }

            // Firebase servislerini al
            auth = firebase.auth();
            db = firebase.firestore();
            analytics = firebase.analytics ? firebase.analytics() : null;

            // Global erişim için window nesnesine atama
            window.auth = auth;
            window.db = db;
            window.firebase = {
                app: firebaseApp,
                auth: auth,
                db: db,
                analytics: analytics,
                // Firebase fonksiyonlarını kolayca erişilebilir yap
                signInWithEmailAndPassword: (email, password) => 
                    firebase.auth().signInWithEmailAndPassword(email, password),
                createUserWithEmailAndPassword: (email, password) => 
                    firebase.auth().createUserWithEmailAndPassword(email, password),
                sendPasswordResetEmail: (email) => 
                    firebase.auth().sendPasswordResetEmail(email),
                signOut: () => 
                    firebase.auth().signOut(),
                collection: (path) => 
                    firebase.firestore().collection(path),
                doc: (collection, docId) => 
                    docId ? firebase.firestore().collection(collection).doc(docId) : firebase.firestore().doc(collection),
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

            console.log("Firebase başarıyla başlatıldı");
            resolve(true);
        } catch (error) {
            console.error("Firebase başlatma hatası:", error);
            reject(error);
        }
    });
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
