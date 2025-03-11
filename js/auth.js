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
        const userCredential = await firebase.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Kullanıcı bilgilerini Firestore'dan al
        const userDoc = await firebase.getDoc(firebase.doc('users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Avatar için kullanıcı adının ilk harfini ayarla
            document.querySelector('.user-avatar').textContent = userData.name.charAt(0).toUpperCase();
            
            showToast(`Hoş geldiniz, ${userData.name}`, 'success');
        } else {
            showToast('Kullanıcı bilgileri alınamadı, tekrar giriş yapmanız gerekebilir', 'warning');
        }
        
        // Ana uygulamayı göster
        showMainApp();
        
        // İlk sayfayı yükle
        showPage(currentPage || 'dashboard');
        
        return user;
    } catch (error) {
        console.error("Giriş hatası:", error);
        
        // Hata mesajına göre kullanıcıya bilgi ver
        let errorMessage = 'Giriş yapılırken bir hata oluştu.';
        
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
        
        showToast(errorMessage, 'error');
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
        
        // Kullanıcı adı kontrolü - mevcut bir kullanıcı adı mı?
        const usernameQuery = await firebase.getDocs(
            firebase.query(
                firebase.collection('users'),
                firebase.where('username', '==', username)
            )
        );
        
        if(!usernameQuery.empty) {
            showToast('Bu kullanıcı adı zaten kullanımda', 'warning');
            toggleLoading(false);
            return;
        }
        
        // Firebase ile kullanıcı oluştur
        const userCredential = await firebase.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Kullanıcı bilgilerini Firestore'a kaydet
        await firebase.setDoc(firebase.doc('users', user.uid), {
            name: name,
            email: email,
            username: username,
            department: department,
            createdAt: firebase.serverTimestamp(),
            role: 'user', // Varsayılan rol
            lastLogin: firebase.serverTimestamp()
        });
        
        showToast('Kayıt işlemi başarılı! Giriş yapabilirsiniz.', 'success');
        showLogin();
        
        return user;
    } catch (error) {
        console.error("Kayıt hatası:", error);
        
        // Hata mesajına göre kullanıcıya bilgi ver
        let errorMessage = 'Kayıt olurken bir hata oluştu.';
        
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
                errorMessage = 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
                break;
        }
        
        showToast(errorMessage, 'error');
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
        await firebase.sendPasswordResetEmail(email);
        
        showToast(`${email} adresine şifre sıfırlama bağlantısı gönderildi.`, 'success');
        showLogin();
        
        return true;
    } catch (error) {
        console.error("Şifre sıfırlama hatası:", error);
        
        // Hata mesajına göre kullanıcıya bilgi ver
        let errorMessage = 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu.';
        
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
        
        showToast(errorMessage, 'error');
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
        await firebase.signOut();
        
        showToast('Başarıyla çıkış yapıldı', 'success');
        
        // Giriş sayfasına yönlendir
        showLogin();
        
        return true;
    } catch (error) {
        console.error("Çıkış hatası:", error);
        showToast('Çıkış yapılırken bir hata oluştu', 'error');
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
        updateData.updatedAt = firebase.serverTimestamp();
        
        // Kullanıcı bilgilerini güncelle
        await firebase.db.collection('users').doc(user.uid).update(updateData);
        
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
        showToast('Profil güncellenirken bir hata oluştu', 'error');
        throw error;
    } finally {
        // Loading gizle
        toggleLoading(false);
    }
}

// Kullanıcıya rol atama (admin için)
async function assignUserRole(userId, role) {
    try {
        // Loading göster
        toggleLoading(true);
        
        // Geçerli kullanıcı yönetici mi kontrol et
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            showToast('Kullanıcı oturumu bulunamadı', 'error');
            toggleLoading(false);
            return;
        }
        
        const currentUserDoc = await firebase.db.collection('users').doc(currentUser.uid).get();
        if (!currentUserDoc.exists || currentUserDoc.data().role !== 'admin') {
            showToast('Bu işlem için yönetici yetkisi gereklidir', 'error');
            toggleLoading(false);
            return;
        }
        
        // Kullanıcı rolünü güncelle
        await firebase.db.collection('users').doc(userId).update({
            role: role,
            updatedAt: firebase.serverTimestamp(),
            updatedBy: currentUser.uid
        });
        
        showToast(`Kullanıcı rolü başarıyla "${role}" olarak güncellendi`, 'success');
        
        return true;
    } catch (error) {
        console.error("Rol atama hatası:", error);
        showToast('Rol atanırken bir hata oluştu', 'error');
        throw error;
    } finally {
        // Loading gizle
        toggleLoading(false);
    }
}

// Kullanıcı kayıtlarını getir (admin için)
async function getUsersList() {
    try {
        // Loading göster
        toggleLoading(true);
        
        // Geçerli kullanıcı yönetici mi kontrol et
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            showToast('Kullanıcı oturumu bulunamadı', 'error');
            toggleLoading(false);
            return;
        }
        
        const currentUserDoc = await firebase.db.collection('users').doc(currentUser.uid).get();
        if (!currentUserDoc.exists || currentUserDoc.data().role !== 'admin') {
            showToast('Bu işlem için yönetici yetkisi gereklidir', 'error');
            toggleLoading(false);
            return;
        }
        
        // Tüm kullanıcıları getir
        const usersSnapshot = await firebase.db.collection('users').get();
        
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return users;
    } catch (error) {
        console.error("Kullanıcı listesi getirme hatası:", error);
        showToast('Kullanıcı listesi alınırken bir hata oluştu', 'error');
        throw error;
    } finally {
        // Loading gizle
        toggleLoading(false);
    }
}
