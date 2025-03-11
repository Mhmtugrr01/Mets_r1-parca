/**
 * main.js
 * Uygulama ana işlevleri ve yardımcı fonksiyonlar
 */

// Global durum değişkenleri
let currentPage = 'dashboard';
let isUserLoggedIn = false;
let currentUser = null;

// Uygulama başlatma fonksiyonu
function initApp() {
    // Kullanıcı oturum durumunu dinle
    firebase.auth().onAuthStateChanged(handleAuthStateChanged);
    
    // Sayfa olaylarını ayarla
    setupEventListeners();
    
    // Service worker kayıt (PWA desteği için)
    registerServiceWorker();
}

// Sayfa olay dinleyicilerini ayarla
function setupEventListeners() {
    // Navigasyon menü öğeleri
    document.querySelectorAll('.navbar-item').forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('onclick')?.replace("showPage('", "").replace("')", "") || '';
            if (pageId) {
                showPage(pageId);
                // Tıklama olayını durdur (showPage zaten çağrılıyor)
                event.preventDefault();
            }
        });
    });
    
    // Kullanıcı menüsü
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', toggleUserMenu);
    }
    
    // Belirli butonlar için olay dinleyicileri
    const refreshBtn = document.querySelector('.page-header .btn-outline');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshData);
    }
    
    // Yeni sipariş butonu
    const newOrderBtn = document.querySelector('.btn-primary:has(.fa-plus)');
    if (newOrderBtn) {
        newOrderBtn.addEventListener('click', showCreateOrderModal);
    }
    
    // Modal kapatma butonları
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modalId = this.closest('.modal').id;
            closeModal(modalId);
        });
    });
    
    // Tab içerikleri için olay dinleyicileri
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabContentId = this.getAttribute('data-tab');
            switchTab(tabContentId);
        });
    });
    
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
    
    // Çıkış butonu
    const logoutBtn = document.querySelector('.user-dropdown-item:has(.fa-sign-out-alt)');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Enter tuşu ile mesaj gönderme (chatbot için)
    const chatInput = document.getElementById('chatbot-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // Arama filtresi
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterOrders);
    }
    
    // Durum ve müşteri filtreleri
    document.querySelectorAll('.filter-item select').forEach(select => {
        select.addEventListener('change', filterOrders);
    });
    
    // Sayfa dışına tıklandığında dropdown ve modalları kapat
    window.addEventListener('click', function(event) {
        // Dropdown kontrolü
        if (!event.target.matches('.user-avatar')) {
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown && dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            }
        }
        
        // Modal kontrolü - modal arka planına tıklandığında
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Escape tuşu ile modalları kapat
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'block') {
                    closeModal(modal.id);
                }
            });
        }
    });
}

// Kullanıcı menüsünü göster/gizle
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

// Service worker kayıt
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/service-worker.js')
                .then(function(registration) {
                    console.log('ServiceWorker başarıyla kaydedildi:', registration.scope);
                })
                .catch(function(error) {
                    console.log('ServiceWorker kaydı başarısız:', error);
                });
        });
    }
}

// Kullanıcı oturum durumu değişikliği
function handleAuthStateChanged(user) {
    if (user) {
        // Kullanıcı giriş yapmış
        isUserLoggedIn = true;
        currentUser = user;
        
        // Kullanıcı bilgilerini Firestore'dan al
        loadUserData(user.uid);
        
        // Ana uygulamayı göster
        showMainApp();
        
        // Dashboard verilerini yükle (eğer dashboard sayfasındaysa)
        if (currentPage === 'dashboard') {
            loadDashboardData();
        }
    } else {
        // Kullanıcı çıkış yapmış
        isUserLoggedIn = false;
        currentUser = null;
        
        // Giriş sayfasını göster
        showLogin();
    }
}

// Kullanıcı bilgilerini Firestore'dan al
async function loadUserData(userId) {
    try {
        const userDoc = await firebase.db.collection('users').doc(userId).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Avatar için kullanıcı adının ilk harfini ayarla
            const avatarElement = document.querySelector('.user-avatar');
            if (avatarElement && userData.name) {
                avatarElement.textContent = userData.name.charAt(0).toUpperCase();
            }
            
            // Kullanıcı adını headerda göster
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement && userData.name) {
                userNameElement.textContent = userData.name;
            }
            
            // Departman bilgisini göster
            const userDeptElement = document.querySelector('.user-department');
            if (userDeptElement && userData.department) {
                userDeptElement.textContent = userData.department;
            }
            
            return userData;
        } else {
            console.warn("Kullanıcı verisi bulunamadı");
            return null;
        }
    } catch (error) {
        console.error("Kullanıcı verileri yüklenirken hata:", error);
        return null;
    }
}

// Sayfa değiştirme
function showPage(pageName) {
    // Sayfaları gizle
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // İstenen sayfayı göster
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageName;
        
        // Sayfa başlığı ve URL'yi güncelle
        document.title = `MehmetEndustriyelTakip - ${getPageTitle(pageName)}`;
        history.pushState({ page: pageName }, document.title, `#${pageName}`);
    }
    
    // Menü öğelerini güncelle
    const menuItems = document.querySelectorAll('.navbar-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // İlgili menü öğesini aktif et
    const activeMenuItem = document.querySelector(`.navbar-item[onclick="showPage('${pageName}')"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }
    
    // Sayfa özel içeriklerini yükle
    loadPageContent(pageName);
}

// Sayfa başlığını getir
function getPageTitle(pageName) {
    const titles = {
        'dashboard': 'Kontrol Paneli',
        'sales': 'Satış',
        'projects': 'Projeler',
        'production': 'Üretim',
        'stock': 'Stok',
        'purchasing': 'Satın Alma',
        'quality': 'Kalite',
        'reports': 'Raporlar',
        'notes': 'Notlar',
        'ai': 'Yapay Zeka',
        'settings': 'Ayarlar'
    };
    
    return titles[pageName] || 'MehmetEndustriyelTakip';
}

// Sayfa içeriğini yükle
function loadPageContent(pageName) {
    switch (pageName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'sales':
            // Satış sayfası içeriğini yükle
            break;
        case 'projects':
            // Projeler sayfası içeriğini yükle
            break;
        case 'production':
            // Üretim sayfası içeriğini yükle
            break;
        case 'stock':
            // Stok sayfası içeriğini yükle
            break;
        case 'purchasing':
            // Satın alma sayfası içeriğini yükle
            break;
        case 'quality':
            // Kalite sayfası içeriğini yükle
            break;
        case 'reports':
            // Raporlar sayfası içeriğini yükle
            break;
        case 'notes':
            // Notlar sayfası içeriğini yükle
            break;
        case 'ai':
            // Yapay Zeka sayfası içeriğini yükle
            displayAIInsights('ai-page');
            break;
        case 'settings':
            // Ayarlar sayfası içeriğini yükle
            break;
    }
}

// Modal göster
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// Modal kapat
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Tab değiştir
function switchTab(tabId) {
    // Önceki aktif tab ve içeriğini bul
    const activeTab = document.querySelector('.tab.active');
    const activeContent = document.querySelector('.tab-content.active');
    
    // Önceki aktif sınıfları kaldır
    if (activeTab) activeTab.classList.remove('active');
    if (activeContent) activeContent.classList.remove('active');
    
    // Yeni tabı aktif et
    const newTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
    const newContent = document.getElementById(`${tabId}-content`);
    
    if (newTab) newTab.classList.add('active');
    if (newContent) newContent.classList.add('active');
}

// Giriş sayfasını göster
function showLogin() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('forgot-password-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'none';
}

// Kayıt sayfasını göster
function showRegister() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'flex';
    document.getElementById('forgot-password-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'none';
}

// Şifre sıfırlama sayfasını göster
function showForgotPassword() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('forgot-password-page').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
}

// Ana uygulamayı göster
function showMainApp() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('forgot-password-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
}

// Verileri yenile
function refreshData() {
    // Yenileme animasyonunu başlat
    const refreshBtn = document.querySelector('.page-header .btn-outline i');
    if (refreshBtn) {
        refreshBtn.classList.add('fa-spin');
    }
    
    // Mevcut sayfaya göre verileri yenile
    switch (currentPage) {
        case 'dashboard':
            loadDashboardData().then(() => {
                // Animasyonu durdur
                if (refreshBtn) {
                    setTimeout(() => {
                        refreshBtn.classList.remove('fa-spin');
                    }, 500);
                }
            });
            break;
        case 'sales':
            // Satış verilerini yenile
            break;
        case 'projects':
            // Proje verilerini yenile
            break;
        case 'production':
            // Üretim verilerini yenile
            break;
        case 'stock':
            // Stok verilerini yenile
            break;
        case 'purchasing':
            // Satın alma verilerini yenile
            break;
        case 'quality':
            // Kalite verilerini yenile
            break;
        case 'reports':
            // Rapor verilerini yenile
            break;
        case 'notes':
            // Not verilerini yenile
            break;
        case 'ai':
            // Yapay zeka verilerini yenile
            displayAIInsights('ai-page');
            break;
        default:
            // Varsayılan yenileme işlemi
            break;
    }
    
    // Animasyonu durdur (herhangi bir veri yükleme fonksiyonu çağrılmadıysa)
    if (refreshBtn) {
        setTimeout(() => {
            refreshBtn.classList.remove('fa-spin');
        }, 1000);
    }
}

// Sipariş oluşturma modalını göster
function showCreateOrderModal() {
    // Form alanlarını temizle
    const form = document.getElementById('create-order-form');
    if (form) {
        form.reset();
    }
    
    // Müşteri listesini doldur
    fillCustomerSelect();
    
    // Modalı göster
    showModal('create-order-modal');
}

// URL hash değişikliğini dinle
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page) {
        showPage(event.state.page);
    } else {
        // Varsayılan sayfa
        showPage('dashboard');
    }
});

// Sayfa yüklendiğinde ilk sayfa URL'den belirlensin
window.addEventListener('load', function() {
    let initialPage = 'dashboard';
    
    // URL'den sayfa bilgisini al
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        initialPage = hash.substring(1); // # işaretini kaldır
    }
    
    // Sayfa gösterimi, auth state callback'ten sonra yapılacak
    // Bu nedenle buraya ek bir kod eklemeye gerek yok
    currentPage = initialPage;
});

// İstek durumu mesajını göster (Success, Error, Warning)
function showToast(message, type = 'success', duration = 3000) {
    // Toast container elementini kontrol et veya oluştur
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Toast elementini oluştur
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.marginBottom = '10px';
    toast.style.padding = '10px 15px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.justifyContent = 'space-between';
    toast.style.minWidth = '250px';
    toast.style.maxWidth = '350px';
    
    // Toast içeriğini oluştur
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.alignItems = 'center';
    content.style.gap = '10px';
    
    // İkon
    const icon = document.createElement('i');
    icon.className = 'fas';
    
    // Tip'e göre stil ayarları
    switch (type) {
        case 'success':
            toast.style.backgroundColor = '#d4edda';
            toast.style.color = '#155724';
            icon.className += ' fa-check-circle';
            break;
        case 'error':
            toast.style.backgroundColor = '#f8d7da';
            toast.style.color = '#721c24';
            icon.className += ' fa-times-circle';
            break;
        case 'warning':
            toast.style.backgroundColor = '#fff3cd';
            toast.style.color = '#856404';
            icon.className += ' fa-exclamation-triangle';
            break;
        case 'info':
            toast.style.backgroundColor = '#d1ecf1';
            toast.style.color = '#0c5460';
            icon.className += ' fa-info-circle';
            break;
        default:
            toast.style.backgroundColor = '#f8f9fa';
            toast.style.color = '#212529';
            icon.className += ' fa-bell';
    }
    
    content.appendChild(icon);
    
    // Mesaj metni
    const text = document.createElement('span');
    text.textContent = message;
    content.appendChild(text);
    
    toast.appendChild(content);
    
    // Kapatma butonu
    const closeBtn = document.createElement('button');
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.padding = '0';
    closeBtn.style.color = 'inherit';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginLeft = '10px';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', function() {
        toastContainer.removeChild(toast);
    });
    
    toast.appendChild(closeBtn);
    
    // Toast'u container'a ekle
    toastContainer.appendChild(toast);
    
    // Toast'u otomatik kapat
    setTimeout(() => {
        if (toast.parentNode === toastContainer) {
            // Kaldırılmadan önce animasyon ekle
            toast.style.transition = 'opacity 0.5s ease';
            toast.style.opacity = '0';
            
            setTimeout(() => {
                if (toast.parentNode === toastContainer) {
                    toastContainer.removeChild(toast);
                }
            }, 500);
        }
    }, duration);
}

// Yönlendirme fonksiyonu - hata sayfalarını göster
function showErrorPage(errorCode, errorMessage) {
    // Ana içerik alanını al
    const container = document.querySelector('.container');
    
    if (!container) return;
    
    // Tüm sayfaları gizle
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Hata sayfası HTML'i
    const errorHTML = `
        <div id="error-page" class="page active">
            <div class="page-header">
                <h1 class="page-title">Hata ${errorCode}</h1>
            </div>
            <div class="card">
                <div class="card-body text-center" style="padding: 3rem;">
                    <div style="font-size: 4rem; color: var(--danger); margin-bottom: 1rem;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="margin-bottom: 1rem;">Bir Hata Oluştu</h2>
                    <p style="margin-bottom: 2rem;">${errorMessage}</p>
                    <button class="btn btn-primary" onclick="showPage('dashboard')">
                        <i class="fas fa-home"></i> Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Eski hata sayfasını kaldır
    const oldErrorPage = document.getElementById('error-page');
    if (oldErrorPage) {
        oldErrorPage.remove();
    }
    
    // Yeni hata sayfasını ekle
    container.insertAdjacentHTML('beforeend', errorHTML);
}

// Loading spinner göster/gizle
function toggleLoading(show, containerId = null) {
    // Loading overlay'i al veya oluştur
    let loadingOverlay = document.getElementById('loading-overlay');
    
    if (show) {
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.style.position = containerId ? 'absolute' : 'fixed';
            loadingOverlay.style.top = '0';
            loadingOverlay.style.left = '0';
            loadingOverlay.style.width = '100%';
            loadingOverlay.style.height = '100%';
            loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
            loadingOverlay.style.display = 'flex';
            loadingOverlay.style.alignItems = 'center';
            loadingOverlay.style.justifyContent = 'center';
            loadingOverlay.style.zIndex = '9999';
            
            // Spinner elementi
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            spinner.innerHTML = '<i class="fas fa-spinner fa-spin fa-3x"></i>';
            loadingOverlay.appendChild(spinner);
            
            // Container'a ekle
            if (containerId) {
                const container = document.getElementById(containerId);
                if (container) {
                    container.style.position = 'relative';
                    container.appendChild(loadingOverlay);
                } else {
                    document.body.appendChild(loadingOverlay);
                }
            } else {
                document.body.appendChild(loadingOverlay);
            }
        }
    } else {
        // Loading overlay'i kaldır
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
}
