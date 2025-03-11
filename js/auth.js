/**
 * auth.js
 * Firebase kimlik doğrulama işlevleri - İyileştirilmiş versiyon
 */

// Giriş işlemi
async function login() {
    try {
        // Loading göster
        toggleLoading(true);
        
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if(!email || !password) {
            showToast('E-posta ve şifre giriniz', 'warning');
            toggleLoading(false);
            return;
        }
        
        // Firebase ile giriş yap
        if (firebase && firebase.auth) {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Kullanıcı bilgilerini Firestore'dan al
            if (firebase.firestore) {
                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    
                    // Avatar için kullanıcı adının ilk harfini ayarla
                    document.querySelector('.user-avatar').textContent = userData.name.charAt(0).toUpperCase();
                    
                    showToast(`Hoş geldiniz, ${userData.name}`, 'success');
                } else {
                    showToast('Kullanıcı bilgileri alınamadı, tekrar giriş yapmanız gerekebilir', 'warning');
                }
            }
            
            // Ana uygulamayı göster
            showMainApp();
            
            // İlk sayfayı yükle
            showPage(currentPage || 'dashboard');
            
            return user;
        } else {
            // Firebase yoksa demo giriş yap
            console.warn("Firebase Auth bulunamadı, demo giriş yapılıyor");
            
            // Demo kullanıcısı oluştur
            window.currentUser = {
                uid: 'demo-user',
                email: email,
                displayName: 'Demo Kullanıcı'
            };
            
            // Demo giriş mesajı göster
            showToast('Demo modunda giriş yapıldı', 'info');
            
            // Demo modu bildirimini göster
            const demoModeNotification = document.getElementById('demo-mode-notification');
            if (demoModeNotification) {
                demoModeNotification.style.display = 'block';
            }
            
            // Ana uygulamayı göster
            showMainApp();
            
            // Dashboard'ı yükle
            showPage('dashboard');
        }
    } catch (error) {
        console.error("Giriş hatası:", error);
        
        // Hata mesajına göre kullanıcıya bilgi ver
        let errorMessage = 'Giriş yapılırken bir hata oluştu.';
        
        if (error.code) {
            switch(error.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = 'E-posta adresi veya şifre hatalı.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Bu hesap devre dışı bırakıldı.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
                    break;
            }
        }
        
        showToast(errorMessage, 'error');
        
        // Demo modu için seçenek sun
        if (error.code === 'auth/network-request-failed' || !firebase) {
            setTimeout(() => {
                showToast('Demo modunda kayıt işlemi şu an desteklenmiyor. Lütfen giriş ekranına dönün.', 'info');
            }, 1000);
        }
        
        throw error;
    } finally {
        // Loading gizle
        toggleLoading(false);
    }
}

// Şifre sıfırlama
async function resetPassword() {
    try {
        // Loading göster
        toggleLoading(true);
        
        const email = document.getElementById('forgot-email').value;
        
        if(!email) {
            showToast('E-posta adresinizi giriniz', 'warning');
            toggleLoading(false);
            return;
        }
        
        // Email formatını kontrol et
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            showToast('Geçerli bir e-posta adresi giriniz', 'warning');
            toggleLoading(false);
            return;
        }
        
        // Firebase ile şifre sıfırlama e-postası gönder
        if (firebase && firebase.auth) {
            await firebase.auth().sendPasswordResetEmail(email);
            
            showToast(`${email} adresine şifre sıfırlama bağlantısı gönderildi.`, 'success');
            showLogin();
            
            return true;
        } else {
            // Demo modunda şifre sıfırlama
            console.warn("Firebase Auth bulunamadı, demo şifre sıfırlama");
            
            showToast('Demo modunda şifre sıfırlama işlemi gerçekleştirildi', 'info');
            showLogin();
            
            return true;
        }
    } catch (error) {
        console.error("Şifre sıfırlama hatası:", error);
        
        // Hata mesajına göre kullanıcıya bilgi ver
        let errorMessage = 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu.';
        
        if (error.code) {
            switch(error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Geçersiz e-posta adresi.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
                    break;
            }
        }
        
        showToast(errorMessage, 'error');
        
        // Demo moduna geçme için seçenek
        if (error.code === 'auth/network-request-failed' || !firebase) {
            setTimeout(() => {
                showToast('Demo modunda şifre sıfırlama mümkün değil. Direkt giriş ekranını kullanın.', 'info');
                showLogin();
            }, 1000);
        }
        
        throw error;
    } finally {
        // Loading gizle
        toggleLoading(false);
    }
}

// Çıkış yap
async function logout() {
    try {
        // Loading göster
        toggleLoading(true);
        
        // Firebase ile çıkış yap
        if (firebase && firebase.auth) {
            await firebase.auth().signOut();
            
            showToast('Başarıyla çıkış yapıldı', 'success');
        } else {
            // Demo modunda çıkış
            window.currentUser = null;
            
            showToast('Demo modundan çıkış yapıldı', 'info');
        }
        
        // Giriş sayfasına yönlendir
        showLogin();
        
        return true;
    } catch (error) {
        console.error("Çıkış hatası:", error);
        showToast('Çıkış yapılırken bir hata oluştu', 'error');
        
        // Giriş sayfasına yönlendir (hata olsa bile)
        showLogin();
        
        throw error;
    } finally {
        // Loading gizle
        toggleLoading(false);
    }
}

// Şifremi Değiştir
async function changePassword(currentPassword, newPassword) {
    try {
        // Loading göster
        toggleLoading(true);
        
        // Firebase kontrolü
        if (!firebase || !firebase.auth) {
            throw new Error('Firebase Auth bulunamadı');
        }
        
        // Geçerli kullanıcıyı al
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('Kullanıcı oturumu bulunamadı', 'error');
            toggleLoading(false);
            return;
        }
        
        // Mevcut şifreyi doğrula
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        
        // Kullanıcıyı yeniden doğrula
        await user.reauthenticateWithCredential(credential);
        
        // Şifreyi güncelle
        await user.updatePassword(newPassword);
        
        showToast('Şifreniz başarıyla güncellendi', 'success');
        
        return true;
    } catch (error) {
        console.error("Şifre değiştirme hatası:", error);
        
        // Hata mesajına göre kullanıcıya bilgi ver
        let errorMessage = 'Şifre değiştirilirken bir hata oluştu.';
        
        if (error.code) {
            switch(error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'Mevcut şifreniz hatalı.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Yeni şifre çok zayıf, daha güçlü bir şifre seçin.';
                    break;
                case 'auth/requires-recent-login':
                    errorMessage = 'Bu işlem için yakın zamanda giriş yapmanız gerekiyor. Lütfen çıkış yapıp tekrar giriş yapın.';
                    break;
            }
        }
        
        showToast(errorMessage, 'error');
        throw error;
    } finally {
        // Loading gizle
        toggleLoading(false);
    }
}

// Profil güncelleme
async function updateProfile(userData) {
    try {
        // Loading göster
        toggleLoading(true);
        
        // Firebase kontrolü
        if (!firebase || !firebase.firestore) {
            throw new Error('Firebase Firestore bulunamadı');
        }
        
        // Geçerli kullanıcıyı al
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('Kullanıcı oturumu bulunamadı', 'error');
            toggleLoading(false);
            return;
        }
        
        // Sadece izin verilen alanları güncelle
        const allowedFields = ['name', 'department', 'phone', 'photoURL'];
        const updateData = {};
        
        for (const field of allowedFields) {
            if (userData[field] !== undefined) {
                updateData[field] = userData[field];
            }
        }
        
        // Son güncelleme zamanını ekle
        updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        
        // Kullanıcı bilgilerini güncelle
        await firebase.firestore().collection('users').doc(user.uid).update(updateData);
        
        // Eğer e-posta değiştirilmişse (nadiren gerekir)
        if (userData.email && userData.email !== user.email) {
            await user.updateEmail(userData.email);
            updateData.email = userData.email;
        }
        
        // Displayname güncelle (Firebase Auth)
        if (userData.name) {
            await user.updateProfile({
                displayName: userData.name
            });
        }
        
        // Avatar güncelle (uygulamada)
        if (userData.name) {
            const avatarElement = document.querySelector('.user-avatar');
            if (avatarElement) {
                avatarElement.textContent = userData.name.charAt(0).toUpperCase();
            }
        }
        
        showToast('Profil bilgileriniz başarıyla güncellendi', 'success');
        
        return updateData;
    } catch (error) {
        console.error("Profil güncelleme hatası:", error);
        showToast('Profil güncellenirken bir hata oluştu: ' + error.message, 'error');
        throw error;
    } finally {
        // Loading gizle
        toggleLoading(false);
    }
}

// Eventleri bağla
document.addEventListener('DOMContentLoaded', function() {
    // Giriş formu
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            login();
        });
    }
    
    // Kayıt formu
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            register();
        });
    }
    
    // Şifre sıfırlama formu
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetPassword();
        });
    }
    
    // Şifre değiştirme formu
    const passwordChangeForm = document.getElementById('password-change-form');
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('new-password-confirm').value;
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                showToast('Tüm alanları doldurunuz', 'warning');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showToast('Yeni şifreler eşleşmiyor', 'warning');
                return;
            }
            
            changePassword(currentPassword, newPassword)
                .then(() => {
                    // Formu temizle
                    passwordChangeForm.reset();
                })
                .catch(error => {
                    console.error("Şifre değiştirme hatası:", error);
                });
        });
    }
    
    // Profil güncelleme formu
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('profile-name').value;
            const department = document.getElementById('profile-department').value;
            const phone = document.getElementById('profile-phone').value;
            
            if (!name) {
                showToast('Ad Soyad alanını doldurunuz', 'warning');
                return;
            }
            
            updateProfile({
                name,
                department,
                phone
            })
                .then(() => {
                    console.log("Profil güncellendi");
                })
                .catch(error => {
                    console.error("Profil güncelleme hatası:", error);
                });
        });
    }
});rol edin.';
                    break;
            }
        }
        
        showToast(errorMessage, 'error');
        
        // Demo moduna geçiş seçeneği sun
        if (error.code === 'auth/network-request-failed' || !firebase) {
            setTimeout(() => {
                if (confirm('Firebase bağlantısı kurulamadı. Demo modunda devam etmek ister misiniz?')) {
                    // Demo modu aktifleştir
                    window.currentUser = {
                        uid: 'demo-user',
                        email: email || 'demo@elektrotrack.com',
                        displayName: 'Demo Kullanıcı'
                    };
                    
                    // Demo giriş mesajı göster
                    showToast('Demo modunda giriş yapıldı', 'info');
                    
                    // Demo modu bildirimini göster
                    const demoModeNotification = document.getElementById('demo-mode-notification');
                    if (demoModeNotification) {
                        demoModeNotification.style.display = 'block';
                    }
                    
                    // Ana uygulamayı göster
                    showMainApp();
                    
                    // Dashboard'ı yükle
                    showPage('dashboard');
                }
            }, 500);
        }
        
        throw error;
    } finally {
        // Loading gizle
        toggleLoading(false);
    }
}

// Kayıt işlemi
async function register() {
    try {
        // Loading göster
        toggleLoading(true);
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const username = document.getElementById('register-username').value;
        const department = document.getElementById('register-department').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;
        
        // Validasyon kontrolleri
        if(!name || !email || !username || !department || !password || !confirmPassword) {
            showToast('Tüm alanları doldurunuz', 'warning');
            toggleLoading(false);
            return;
        }
        
        if(password !== confirmPassword) {
            showToast('Şifreler eşleşmiyor', 'warning');
            toggleLoading(false);
            return;
        }
        
        // Şifre gücünü kontrol et
        if(password.length < 6) {
            showToast('Şifre en az 6 karakter olmalı', 'warning');
            toggleLoading(false);
            return;
        }
        
        // Email formatını kontrol et
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            showToast('Geçerli bir e-posta adresi giriniz', 'warning');
            toggleLoading(false);
            return;
        }
        
        // Firebase ile kullanıcı oluştur
        if (firebase && firebase.auth) {
            // Kullanıcı adı kontrolü - mevcut bir kullanıcı adı mı?
            if (firebase.firestore) {
                const usernameQuery = await firebase.firestore().collection('users')
                    .where('username', '==', username)
                    .get();
                
                if(!usernameQuery.empty) {
                    showToast('Bu kullanıcı adı zaten kullanımda', 'warning');
                    toggleLoading(false);
                    return;
                }
            }
            
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Kullanıcı bilgilerini Firestore'a kaydet
            if (firebase.firestore) {
                await firebase.firestore().collection('users').doc(user.uid).set({
                    name: name,
                    email: email,
                    username: username,
                    department: department,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'user', // Varsayılan rol
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            showToast('Kayıt işlemi başarılı! Giriş yapabilirsiniz.', 'success');
            showLogin();
            
            return user;
        } else {
            // Firebase yoksa demo kayıt yap
            console.warn("Firebase Auth bulunamadı, demo kayıt yapılıyor");
            
            showToast('Demo modunda kayıt yapıldı', 'info');
            showLogin();
            
            return {
                uid: 'demo-user',
                email: email,
                displayName: name
            };
        }
    } catch (error) {
        console.error("Kayıt hatası:", error);
        
        // Hata mesajına göre kullanıcıya bilgi ver
        let errorMessage = 'Kayıt olurken bir hata oluştu.';
        
        if (error.code) {
            switch(error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Bu e-posta adresi zaten kullanımda.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Geçersiz e-posta adresi.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Şifre çok zayıf, daha güçlü bir şifre seçin.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Ağ hatası. İnternet bağlantınızı kont
