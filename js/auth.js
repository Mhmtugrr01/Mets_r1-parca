/**
 * auth.js
 * Firebase kimlik doğrulama işlevleri
 */

// Auth referansı
const auth = firebase.auth();
const db = firebase.firestore();

// Giriş işlemleri
function login() {
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if(!email || !password) {
        alert('E-posta ve şifre giriniz');
        return;
    }
    
    // Firebase ile giriş yap
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Giriş başarılı
            const user = userCredential.user;
            console.log("Giriş başarılı:", user.email);
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
        })
        .catch((error) => {
            // Hata
            console.error("Giriş hatası:", error);
            alert('Giriş başarısız: ' + error.message);
        });
}

function register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const username = document.getElementById('register-username').value;
    const department = document.getElementById('register-department').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;
    
    // Validasyon kontrolleri
    if(!name || !email || !username || !department || !password || !confirmPassword) {
        alert('Tüm alanları doldurunuz');
        return;
    }
    
    if(password !== confirmPassword) {
        alert('Şifreler eşleşmiyor');
        return;
    }
    
    // Firebase ile kullanıcı oluştur
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Kayıt başarılı
            const user = userCredential.user;
            
            // Kullanıcı bilgilerini Firestore'a kaydet
            return db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                username: username,
                department: department,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert('Kayıt başarılı! Giriş yapabilirsiniz.');
            showLogin();
        })
        .catch((error) => {
            console.error("Kayıt hatası:", error);
            alert('Kayıt başarısız: ' + error.message);
        });
}

function resetPassword() {
    const email = document.getElementById('forgot-email').value;
    
    if(!email) {
        alert('E-posta adresinizi giriniz');
        return;
    }
    
    // Firebase ile şifre sıfırlama e-postası gönder
    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert(`${email} adresine şifre sıfırlama bağlantısı gönderildi.`);
            showLogin();
        })
        .catch((error) => {
            console.error("Şifre sıfırlama hatası:", error);
            alert('Şifre sıfırlama başarısız: ' + error.message);
        });
}

function logout() {
    // Firebase ile çıkış yap
    auth.signOut()
        .then(() => {
            document.getElementById('main-app').style.display = 'none';
            document.getElementById('login-page').style.display = 'flex';
        })
        .catch((error) => {
            console.error("Çıkış hatası:", error);
        });
}

// Kullanıcı durumu değişikliğini dinle
auth.onAuthStateChanged((user) => {
    if (user) {
        // Kullanıcı giriş yapmış
        console.log("Aktif kullanıcı:", user.email);
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        
        // Kullanıcı bilgilerini yükle
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    document.querySelector('.user-avatar').textContent = userData.name.charAt(0);
                    document.querySelector('.sidebar-user-name').textContent = userData.name;
                    document.querySelector('.sidebar-user-role').textContent = userData.department;
                }
            })
            .catch((error) => {
                console.error("Kullanıcı bilgisi yükleme hatası:", error);
            });
    } else {
        // Kullanıcı çıkış yapmış
        document.getElementById('main-app').style.display = 'none';
        document.getElementById('login-page').style.display = 'flex';
    }
});

// Sayfa görünümü değiştirme işlevleri
function showLogin() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('forgot-password-page').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'flex';
    document.getElementById('forgot-password-page').style.display = 'none';
}

function showForgotPassword() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('forgot-password-page').style.display = 'flex';
}
