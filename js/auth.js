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
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // Kullanıcı bilgilerini Firestore'dan al
                if (firebase.firestore) {
                    try {
                        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            
                            // Avatar için kullanıcı adının ilk harfini ayarla
                            const avatarElement = document.querySelector('.user-avatar');
                            if (avatarElement) {
                                avatarElement.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
                            }
                            
                            showToast(`Hoş geldiniz, ${userData.name || user.email}`, 'success');
                        } else {
                            // Firestore'da kullanıcı bilgisi yoksa oluştur
                            await firebase.firestore().collection('users').doc(user.uid).set({
                                email: user.email,
                                name: user.displayName || email.split('@')[0],
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                                role: 'user'
                            });
                            
                            showToast(`Hoş geldiniz, ${user.displayName || email.split('@')[0]}`, 'success');
                        }
                    } catch (firestoreError) {
                        console.warn("Kullanıcı bilgileri alınamadı:", firestoreError);
                        showToast('Giriş yapıldı ancak kullanıcı bilgileri alınamadı', 'info');
                    }
                }
                
                // Mevcut kullanıcıyı global değişkene kaydet
                window.currentUser = user;
                
                // Ana uygulamayı göster
                showMainApp();
                
                // İlk sayfayı yükle
                showPage(window.currentPage || 'dashboard');
                
                return user;
            } catch (authError) {
                console.error("Firebase giriş hatası:", authError);
                
                // Firebase kimlik doğrulama hatası
                let errorMessage = 'Giriş yapılırken bir hata oluştu.';
                
                if (authError.code) {
                    switch(authError.code) {
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
                
                // Firebase bağlantı sorunu varsa demo moda geç
                if (authError.code === 'auth/network-request-failed' || authError.code === 'auth/internal-error') {
                    enableDemoModeWithLoginPrompt(email);
                }
                
                throw authError;
            }
        } else {
            // Firebase yoksa demo giriş yap
            console.log("Firebase Auth bulunamadı, demo giriş yapılıyor");
            
            // Demo kullanıcısı oluştur
            window.currentUser = {
                uid: 'demo-user',
                email: email,
                displayName: name
            };
        }
    } catch (error) {
        console.error("Kayıt hatası:", error);
        showToast('Kayıt olurken bir hata oluştu', 'error');
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
            showToast('Demo modunda şifre değiştirme işlemi mevcut değil', 'info');
            toggleLoading(false);
            return;
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
            showToast('Demo modunda profil güncelleme işlemi mevcut değil', 'info');
            toggleLoading(false);
            return;
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
            try {
                await user.updateProfile({
                    displayName: userData.name
                });
            } catch (profileError) {
                console.warn("DisplayName güncellenemedi:", profileError);
            }
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
}); email.split('@')[0] || 'Demo Kullanıcı'
            };
            
            // Demo giriş mesajı göster
            showToast('Demo modunda giriş yapıldı', 'info');
            
            // Demo modu bildirimi göster
            const demoModeNotification = document.getElementById('demo-mode-notification');
            if (demoModeNotification) {
                demoModeNotification.style.display = 'block';
            }
            
            // Ana uygulamayı göster
            showMainApp();
            
            // Dashboard'ı yükle
            showPage('dashboard');
            
            return window.currentUser;
        }
    } catch (error) {
        console.error("Giriş hatası:", error);
        showToast('Giriş yapılırken bir hata oluştu', 'error');
        
        // Demo moda geçip otomatik giriş yap
        enableDemoModeWithLoginPrompt();
        
        throw error;
    } finally {
        // Loading gizle
        toggleLoading(false);
    }
}

// Demo modu ile giriş
function enableDemoModeWithLoginPrompt(email = 'demo@elektrotrack.com') {
    // Gecikme ile göster (kullanıcı hatayı görebilsin)
    setTimeout(() => {
        const shouldSwitchToDemo = confirm("Firebase bağlantısı kurulamadı. Demo modunda devam etmek ister misiniz?");
        if (shouldSwitchToDemo) {
            // Demo modu parametresini URL'e ekle
            const currentUrl = new URL(window.location.href);
            if (!currentUrl.searchParams.has('demo')) {
                currentUrl.searchParams.set('demo', 'true');
                window.history.replaceState({}, document.title, currentUrl.toString());
            }
            
            // Demo giriş bilgilerini doldur
            document.getElementById('username').value = 'demo@elektrotrack.com';
            document.getElementById('password').value = 'demo123';
            
            // Demo giriş
            demoLogin();
        }
    }, 500);
}

// Demo giriş işlemi
function demoLogin() {
    // Demo kullanıcısı
    window.currentUser = {
        uid: 'demo-user-1',
        email: 'demo@elektrotrack.com',
        displayName: 'Demo Kullanıcı'
    };
    
    // Demo giriş mesajı göster
    showToast('Demo modunda giriş yapıldı', 'info');
    
    // Demo modu bildirimi göster
    const demoModeNotification = document.getElementById('demo-mode-notification');
    if (demoModeNotification) {
        demoModeNotification.style.display = 'block';
    }
    
    // Ana uygulamayı göster
    showMainApp();
    
    // Dashboard'ı yükle
    showPage('dashboard');
    
    return window.currentUser;
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
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                await firebase.auth().sendPasswordResetEmail(email);
                
                showToast(`${email} adresine şifre sıfırlama bağlantısı gönderildi.`, 'success');
                showLogin();
                
                return true;
            } catch (authError) {
                console.error("Şifre sıfırlama hatası:", authError);
                
                let errorMessage = 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu.';
                
                if (authError.code) {
                    switch(authError.code) {
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
                
                // Demo moda geçme seçeneği sun
                if (authError.code === 'auth/network-request-failed') {
                    enableDemoModeWithLoginPrompt();
                }
                
                throw authError;
            }
        } else {
            // Demo modunda şifre sıfırlama
            console.log("Firebase Auth bulunamadı, demo şifre sıfırlama");
            
            showToast('Demo modunda şifre sıfırlama işlemi gerçekleştirildi', 'info');
            showLogin();
            
            return true;
        }
    } catch (error) {
        console.error("Şifre sıfırlama hatası:", error);
        showToast('Şifre sıfırlama işlemi sırasında bir hata oluştu', 'error');
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
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                await firebase.auth().signOut();
                
                showToast('Başarıyla çıkış yapıldı', 'success');
            } catch (authError) {
                console.error("Çıkış hatası:", authError);
                showToast('Çıkış yapılırken bir hata oluştu', 'error');
            }
        } else {
            // Demo modunda çıkış
            window.currentUser = null;
            
            showToast('Demo modundan çıkış yapıldı', 'info');
        }
        
        // Global kullanıcı değişkenini temizle
        window.currentUser = null;
        
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
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) {
            try {
                // Kullanıcı adı kontrolü - mevcut bir kullanıcı adı mı?
                const usernameQuery = await firebase.firestore().collection('users')
                    .where('username', '==', username)
                    .get();
                
                if(!usernameQuery.empty) {
                    showToast('Bu kullanıcı adı zaten kullanımda', 'warning');
                    toggleLoading(false);
                    return;
                }
                
                // Kullanıcı oluştur
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // Kullanıcı bilgilerini Firestore'a kaydet
                await firebase.firestore().collection('users').doc(user.uid).set({
                    name: name,
                    email: email,
                    username: username,
                    department: department,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'user', // Varsayılan rol
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Displayname güncelle
                await user.updateProfile({
                    displayName: name
                });
                
                showToast('Kayıt işlemi başarılı! Giriş yapabilirsiniz.', 'success');
                showLogin();
                
                return user;
            } catch (authError) {
                console.error("Firebase kayıt hatası:", authError);
                
                let errorMessage = 'Kayıt olurken bir hata oluştu.';
                
                if (authError.code) {
                    switch(authError.code) {
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
                            errorMessage = 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
                            break;
                    }
                }
                
                showToast(errorMessage, 'error');
                
                // Firebase bağlantı sorunu varsa demo moda geç
                if (authError.code === 'auth/network-request-failed') {
                    enableDemoModeWithLoginPrompt();
                }
                
                throw authError;
            }
        } else {
            // Firebase yoksa demo kayıt yap
            console.log("Firebase Auth bulunamadı, demo kayıt yapılıyor");
            
            showToast('Demo modunda kayıt işlemi şu an desteklenmiyor. Lütfen demo kullanıcısı ile giriş yapın.', 'info');
            showLogin();
            
            return {
                uid: 'demo-user',
                email: email,
                displayName:
