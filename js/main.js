// Dashboard verilerini yükle (eğer dashboard sayfasındaysa)
        if (currentPage === 'dashboard') {
            setTimeout(() => {
                loadDashboardData();
            }, 100);
        } else {
            // Farklı sayfa istendiyse onu göster
            showPage(currentPage);
        }
    } else {
        // Kullanıcı çıkış yapmış
        isUserLoggedIn = false;
        currentUser = null;
        
        // Demo modunda otomatik giriş yap
        if (isDemo) {
            // Demo kullanıcısıyla otomatik giriş yap
            try {
                if (firebase && firebase.auth) {
                    firebase.auth().signInWithEmailAndPassword('demo@elektrotrack.com', 'demo123')
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
                            // Firebase hata verirse, yine de ana uygulamaya yönlendir
                            showMainApp();
                            loadDashboardData();
                        });
                } else {
                    // Firebase yoksa direkt ana uygulamayı göster
                    showMainApp();
                    loadDashboardData();
                }
            } catch (error) {
                console.warn("Demo modu otomatik giriş hatası:", error);
                // Hata olsa da direkt ana uygulamayı göster
                showMainApp();
                loadDashboardData();
            }
        } else {
            // Normal modda giriş sayfasını göster
            showLogin();
        }
    }
}

// Kullanıcı bilgilerini Firestore'dan al
async function loadUserData(userId) {
    try {
        if (!firebase || !firebase.firestore) {
            throw new Error("Firebase Firestore bulunamadı");
        }
        
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Avatar için kullanıcı adının ilk harfini ayarla
            const avatarElement = document.querySelector('.user-avatar');
            if (avatarElement && userData.name) {
                avatarElement.textContent = userData.name.charAt(0).toUpperCase();
            } else if (avatarElement && currentUser.email) {
                avatarElement.textContent = currentUser.email.charAt(0).toUpperCase();
            }
            
            return userData;
        } else {
            console.warn("Kullanıcı verisi bulunamadı");
            
            // Kullanıcı verisini oluştur
            if (firebase && firebase.firestore) {
                await firebase.firestore().collection('users').doc(userId).set({
                    name: currentUser.displayName || currentUser.email.split('@')[0],
                    email: currentUser.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'user'
                });
            }
            
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
    } else {
        console.warn(`Sayfa bulunamadı: ${pageName}`);
        // Sayfa bulunamadıysa dashboard'a yönlendir
        if (pageName !== 'dashboard') {
            showPage('dashboard');
            return;
        }
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
        'profile': 'Profilim',
        'settings': 'Ayarlar'
    };
    
    return titles[pageName] || 'MehmetEndustriyelTakip';
}

// Sayfa içeriğini yükle
function loadPageContent(pageName) {
    console.log(`${pageName} sayfası yükleniyor...`);
    
    switch (pageName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'sales':
            // Satış sayfası içeriğini yükle
            showLoadingInCard('sales-page');
            // İleriki sürümlerde eklenecek
            break;
        case 'projects':
            // Projeler sayfası içeriğini yükle
            showLoadingInCard('projects-page');
            // İleriki sürümlerde eklenecek
            break;
        case 'production':
            // Üretim sayfası içeriğini yükle
            showLoadingInCard('production-page');
            if (typeof loadProductionPlans === 'function') {
                loadProductionPlans();
            }
            break;
        case 'stock':
            // Stok sayfası içeriğini yükle
            showLoadingInCard('stock-page');
            // İleriki sürümlerde eklenecek
            break;
        case 'purchasing':
            // Satın alma sayfası içeriğini yükle
            showLoadingInCard('purchasing-page');
            if (typeof loadPurchaseRequests === 'function') {
                loadPurchaseRequests();
            }
            break;
        case 'quality':
            // Kalite sayfası içeriğini yükle
            showLoadingInCard('quality-page');
            // İleriki sürümlerde eklenecek
            break;
        case 'reports':
            // Raporlar sayfası içeriğini yükle
            showLoadingInCard('reports-page');
            // İleriki sürümlerde eklenecek
            break;
        case 'notes':
            // Notlar sayfası içeriğini yükle
            showLoadingInCard('notes-page');
            // İleriki sürümlerde eklenecek
            break;
        case 'ai':
            // Yapay Zeka sayfası içeriğini yükle
            showLoadingInCard('ai-page');
            // Yapay zeka önerilerini yükle
            if (typeof displayAIInsights === 'function') {
                displayAIInsights('ai-page');
            }
            break;
        case 'profile':
            // Profil sayfası içeriğini yükle
            loadProfileData();
            break;
        case 'settings':
            // Ayarlar sayfası içeriğini yükle
            loadSettingsData();
            break;
    }
}

// Profil verilerini yükle
function loadProfileData() {
    if (!currentUser) return;
    
    // Profil formunu doldur
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileDepartment = document.getElementById('profile-department');
    const profilePhone = document.getElementById('profile-phone');
    
    // Email doğrudan geliyor
    if (profileEmail) profileEmail.value = currentUser.email || '';
    
    // Diğer bilgileri Firebase'den al
    if (firebase && firebase.firestore) {
        firebase.firestore().collection('users').doc(currentUser.uid).get()
            .then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    if (profileName) profileName.value = userData.name || '';
                    if (profileDepartment) profileDepartment.value = userData.department || '';
                    if (profilePhone) profilePhone.value = userData.phone || '';
                }
            })
            .catch(error => {
                console.error("Profil verileri yüklenemedi:", error);
                showToast("Profil verileri yüklenemedi", "error");
            });
    }
}

// Ayarlar verilerini yükle
function loadSettingsData() {
    // Tema, dil ve bildirim ayarlarını localStorage'dan al
    const themeSelect = document.getElementById('theme-select');
    const languageSelect = document.getElementById('language-select');
    const notificationsEnabled = document.getElementById('notifications-enabled');
    
    if (themeSelect) themeSelect.value = localStorage.getItem('theme') || 'light';
    if (languageSelect) languageSelect.value = localStorage.getItem('language') || 'tr';
    if (notificationsEnabled) notificationsEnabled.checked = localStorage.getItem('notifications') === 'true';
    
    // Form submit olayını dinle
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Ayarları kaydet
            localStorage.setItem('theme', themeSelect.value);
            localStorage.setItem('language', languageSelect.value);
            localStorage.setItem('notifications', notificationsEnabled.checked);
            
            // Temayı hemen uygula
            applyTheme(themeSelect.value);
            
            showToast("Ayarlar kaydedildi", "success");
        });
    }
}

// Temayı uygula
function applyTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark') {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
}

// Modal içerisinde loading göster
function showLoadingInCard(pageId) {
    const page = document.getElementById(pageId);
    if (!page) return;
    
    const cardBodies = page.querySelectorAll('.card-body');
    cardBodies.forEach(cardBody => {
        if (!cardBody.querySelector('.loading-spinner')) {
            cardBody.innerHTML = `
                <div class="loading-spinner text-center" style="padding: 2rem;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color: var(--primary);"></i>
                    <p style="margin-top: 1rem;">Veriler yükleniyor...</p>
                </div>
            `;
        }
    });
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
            setTimeout(() => {
                if (refreshBtn) refreshBtn.classList.remove('fa-spin');
                showToast("Satış verileri güncellendi", "success");
            }, 1000);
            break;
        case 'projects':
            // Proje verilerini yenile
            setTimeout(() => {
                if (refreshBtn) refreshBtn.classList.remove('fa-spin');
                showToast("Proje verileri güncellendi", "success");
            }, 1000);
            break;
        case 'production':
            // Üretim verilerini yenile
            if (typeof loadProductionPlans === 'function') {
                loadProductionPlans();
            }
            setTimeout(() => {
                if (refreshBtn) refreshBtn.classList.remove('fa-spin');
                showToast("Üretim verileri güncellendi", "success");
            }, 1000);
            break;
        case 'stock':
            // Stok verilerini yenile
            setTimeout(() => {
                if (refreshBtn) refreshBtn.classList.remove('fa-spin');
                showToast("Stok verileri güncellendi", "success");
            }, 1000);
            break;
        case 'purchasing':
            // Satın alma verilerini yenile
            if (typeof loadPurchaseRequests === 'function') {
                loadPurchaseRequests();
            }
            if (typeof loadMissingMaterials === 'function') {
                loadMissingMaterials();
            }
            setTimeout(() => {
                if (refreshBtn) refreshBtn.classList.remove('fa-spin');
                showToast("Satın alma verileri güncellendi", "success");
            }, 1000);
            break;
        case 'quality':
            // Kalite verilerini yenile
            setTimeout(() => {
                if (refreshBtn) refreshBtn.classList.remove('fa-spin');
                showToast("Kalite verileri güncellendi", "success");
            }, 1000);
            break;
        case 'reports':
            // Rapor verilerini yenile
            setTimeout(() => {
                if (refreshBtn) refreshBtn.classList.remove('fa-spin');
                showToast("Rapor verileri güncellendi", "success");
            }, 1000);
            break;
        case 'notes':
            // Not verilerini yenile
            setTimeout(() => {
                if (refreshBtn) refreshBtn.classList.remove('fa-spin');
                showToast("Not verileri güncellendi", "success");
            }, 1000);
            break;
        case 'ai':
            // Yapay zeka verilerini yenile
            if (typeof displayAIInsights === 'function') {
                displayAIInsights('ai-page');
            }
            setTimeout(() => {
                if (refreshBtn) refreshBtn.classList.remove('fa-spin');
                showToast("Yapay zeka önerileri güncellendi", "success");
            }, 1000);
            break;
        default:
            // Varsayılan yenileme işlemi
            if (refreshBtn) {
                setTimeout(() => {
                    refreshBtn.classList.remove('fa-spin');
                }, 1000);
            }
            break;
    }
}

// Sipariş oluşturma modalını göster
function showCreateOrderModal() {
    // Form alanlarını temizle
    const form = document.getElementById('create-order-form');
    if (form) {
        form.reset();
        
        // Bugünün tarihini ayarla
        const orderDateInput = form.elements['orderDate'];
        const deliveryDateInput = form.elements['deliveryDate'];
        if (orderDateInput) {
            const today = new Date().toISOString().split('T')[0];
            orderDateInput.value = today;
        }
        if (deliveryDateInput) {
            // 30 gün sonrası için teslim tarihi
            const defaultDeliveryDate = new Date();
            defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + 30);
            deliveryDateInput.value = defaultDeliveryDate.toISOString().split('T')[0];
        }
    }
    
    // Müşteri listesini doldur
    fillCustomerSelect();
    
    // Modalı göster
    showModal('create-order-modal');
}

// Müşteri seçim listesini doldur
function fillCustomerSelect() {
    const customerSelect = document.querySelector('#create-order-form select[name="customer"]');
    if (!customerSelect) return;
    
    // Yükleniyor
    customerSelect.innerHTML = '<option value="">Yükleniyor...</option>';
    
    // Firestore'dan müşterileri al
    if (firebase && firebase.firestore) {
        firebase.firestore().collection('customers').orderBy('name', 'asc').get()
            .then(snapshot => {
                if (snapshot.empty) {
                    // Örnek müşteri listesi oluştur
                    const sampleCustomers = [
                        { id: 'customer-1', name: 'AYEDAŞ' },
                        { id: 'customer-2', name: 'ENERJİSA' },
                        { id: 'customer-3', name: 'BAŞKENT EDAŞ' },
                        { id: 'customer-4', name: 'TOROSLAR EDAŞ' }
                    ];
                    
                    // Boş olduğunu göster ve örnek veri ekle
                    customerSelect.innerHTML = '<option value="">Müşteri Seçin</option>';
                    sampleCustomers.forEach(customer => {
                        customerSelect.innerHTML += `<option value="${customer.name}">${customer.name}</option>`;
                    });
                    
                    return;
                }
                
                // Müşteri listesini doldur
                customerSelect.innerHTML = '<option value="">Müşteri Seçin</option>';
                snapshot.forEach(doc => {
                    const customer = doc.data();
                    customerSelect.innerHTML += `<option value="${customer.name}">${customer.name}</option>`;
                });
            })
            .catch(error => {
                console.error('Müşteri listesi yükleme hatası:', error);
                customerSelect.innerHTML = '<option value="">Hata: Müşteriler yüklenemedi</option>';
                
                // Örnek müşteri listesi oluştur
                setTimeout(() => {
                    const sampleCustomers = [
                        { id: 'customer-1', name: 'AYEDAŞ' },
                        { id: 'customer-2', name: 'ENERJİSA' },
                        { id: 'customer-3', name: 'BAŞKENT EDAŞ' },
                        { id: 'customer-4', name: 'TOROSLAR EDAŞ' }
                    ];
                    
                    customerSelect.innerHTML = '<option value="">Müşteri Seçin</option>';
                    sampleCustomers.forEach(customer => {
                        customerSelect.innerHTML += `<option value="${customer.name}">${customer.name}</option>`;
                    });
                }, 500);
            });
    } else {
        // Firebase yoksa örnek veriler
        const sampleCustomers = [
            { id: 'customer-1', name: 'AYEDAŞ' },
            { id: 'customer-2', name: 'ENERJİSA' },
            { id: 'customer-3', name: 'BAŞKENT EDAŞ' },
            { id: 'customer-4', name: 'TOROSLAR EDAŞ' }
        ];
        
        customerSelect.innerHTML = '<option value="">Müşteri Seçin</option>';
        sampleCustomers.forEach(customer => {
            customerSelect.innerHTML += `<option value="${customer.name}">${customer.name}</option>`;
        });
    }
}

// Sipariş detayını göster
function showOrderDetail(orderId) {
    // Sipariş detaylarını getir ve modalı hazırla
    const titleElement = document.querySelector('#order-detail-modal .modal-title');
    const idElement = document.getElementById('order-detail-id');
    
    if (idElement) idElement.textContent = orderId;
    
    // Modalı göster (içeriği daha sonra doldurulacak)
    showModal('order-detail-modal');
    
    // Sipariş verilerini getir
    if (typeof showOrderDetailData === 'function') {
        showOrderDetailData(orderId);
    } else {
        // Fonksiyon yoksa örnek veriler
        setTimeout(() => {
            // Form verilerini örnek değerlerle doldur
            document.querySelector('#order-general input[name="orderNo"]').value = `24-03-${orderId.substring(0, 4).toUpperCase()}`;
            document.querySelector('#order-general input[name="customer"]').value = "AYEDAŞ";
            document.querySelector('#order-general input[name="cellType"]').value = "RM 36 LB";
            document.querySelector('#order-general input[name="cellCount"]').value = "3";
            document.querySelector('#order-general input[name="orderDate"]').value = "01.03.2024";
            document.querySelector('#order-general input[name="deliveryDate"]').value = "15.05.2024";
            document.querySelector('#order-general select[name="status"]').value = "production";
            
            // İş akışı durumunu güncelle
            updateWorkflowStatus("production");
        }, 500);
    }
}

// İş akışı durumunu güncelle
function updateWorkflowStatus(status) {
    const steps = document.querySelectorAll('.workflow-step');
    if (!steps || steps.length === 0) return;
    
    // Tüm adımları sıfırla
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
    });
    
    // Durum göre adımları işaretle
    switch (status) {
        case 'planning':
            steps[0].classList.add('completed');
            steps[1].classList.add('active');
            break;
        case 'waiting':
            steps[0].classList.add('completed');
            steps[1].classList.add('completed');
            steps[2].classList.add('active');
            break;
        case 'production':
            steps[0].classList.add('completed');
            steps[1].classList.add('completed');
            steps[2].classList.add('completed');
            steps[3].classList.add('active');
            break;
        case 'ready':
        case 'testing':
            steps[0].classList.add('completed');
            steps[1].classList.add('completed');
            steps[2].classList.add('completed');
            steps[3].classList.add('completed');
            steps[4].classList.add('active');
            break;
        case 'completed':
            steps.forEach(step => step.classList.add('completed'));
            break;
        default:
            steps[0].classList.add('active');
    }
}

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
            spinner.innerHTML = '<i class="fas fa-spinner fa-spin fa-3x" style="color: var(--primary);"></i>';
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

// Optimizasyon planını uygula (demo)
function applyOptimizationPlan() {
    // Yükleniyor göster
    toggleLoading(true);
    
    // Demo için biraz bekleyelim
    setTimeout(() => {
        // Yükleniyor gizle
        toggleLoading(false);
        
        // Başarılı mesajı göster
        showToast("Optimizasyon planı başarıyla uygulandı. Üretim planları güncellendi.", "success");
        
        // Bildirimi kapat
        const aiRecommendations = document.getElementById('ai-recommendations');
        if (aiRecommendations) {
            aiRecommendations.innerHTML = `
                <div class="info-box success">
                    <div class="info-box-title">Optimizasyon Tamamlandı</div>
                    <div class="info-box-content">
                        <p>RM 36 LB tipindeki 3 siparişin üretimi birleştirildi. Tasarruf: 5 iş günü, 12.500₺ maliyet.</p>
                    </div>
                </div>
            `;
        }
        
        // Dashboard verilerini yenile
        loadDashboardData();
    }, 2000);
}

// Yardımcılar
function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString('tr-TR');
}

function formatDate(date) {
    if (!date) return '';
    
    if (typeof date === 'string') {
        // ISO formatında ise
        if (date.includes('T')) {
            date = new Date(date);
        } else if (date.includes('.')) {
            // TR formatında (12.05.2024) ise
            const parts = date.split('.');
            if (parts.length === 3) {
                date = new Date(parts[2], parts[1] - 1, parts[0]);
            } else {
                return date; // Anlaşılamayan format
            }
        } else if (date.includes('/')) {
            // US formatında (05/12/2024) ise
            const parts = date.split('/');
            if (parts.length === 3) {
                date = new Date(parts[2], parts[0] - 1, parts[1]);
            } else {
                return date; // Anlaşılamayan format
            }
        } else {
            return date; // Anlaşılamayan format
        }
    } else if (!(date instanceof Date)) {
        // Firebase Timestamp ise
        if (date.toDate && typeof date.toDate === 'function') {
            date = date.toDate();
        } else {
            return ''; // Geçersiz format
        }
    }
    
    return date.toLocaleDateString('tr-TR');
}

// Sayfa yüklendiğinde initApp çağrılsın
document.addEventListener('DOMContentLoaded', function() {
    if (typeof initApp === 'function') {
        // initApp zaten tanımlandı, burada tekrar çağırmaya gerek yok
        // Firebase-config.js içinde çağrılıyor
    } else {
        // initApp tanımlanmamış, burada tanımlayalım
        console.log("initApp tanımlanmamış, doğrudan başlatılıyor");
        window.initApp = initApp;
        initApp();
    }
});/**
 * main.js
 * Uygulama ana işlevleri ve yardımcı fonksiyonlar
 */

// Global durum değişkenleri
let currentPage = 'dashboard';
let isUserLoggedIn = false;
let currentUser = null;

// Demo mod kontrolü
const isDemo = window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('netlify.app') ||
               window.location.search.includes('demo=true');

// Uygulama başlatma fonksiyonu
function initApp() {
    console.log("Uygulama başlatılıyor...");
    
    // Sayfa olaylarını ayarla
    setupEventListeners();
    
    // Kullanıcı oturum durumunu dinle
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(handleAuthStateChanged);
    } else {
        console.warn("Firebase Auth bulunamadı, demo moduna geçiliyor");
        // Demo modunda direkt ana uygulamayı göster
        showMainApp();
        loadDashboardData();
    }
    
    // Service worker kayıt (PWA desteği için)
    registerServiceWorker();
    
    // URL'den sayfa yönlendirmesini kontrol et
    handleURLRouting();
}

// URL'den sayfa yönlendirmesini kontrol et
function handleURLRouting() {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        const pageName = hash.substring(1);
        currentPage = pageName;
        // Auth kontrol edildikten sonra doğru sayfa yüklenecek
    }
}

// Sayfa olay dinleyicilerini ayarla
function setupEventListeners() {
    // Navigasyon menü öğeleri
    document.querySelectorAll('.navbar-item').forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
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
    
    // URL hash değişikliğini dinle
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            const pageName = hash.substring(1);
            showPage(pageName);
        }
    });
    
    // Arama filtresi
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterOrders);
    }
    
    // Chatbot input için Enter tuşu
    const chatInput = document.getElementById('chatbot-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // Sayfa dışına tıklandığında dropdown ve modalları kapat
    document.addEventListener('click', function(event) {
        // Dropdown kontrolü
        if (!event.target.matches('.user-avatar') && !event.target.closest('.user-dropdown')) {
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
        
        console.log("Kullanıcı giriş yaptı:", user.email);
        
        // Kullanıcı bilgilerini Firestore'dan al
        loadUserData(user.uid);
        
        // Ana uygulamayı göster
        showMainApp();
        
        // Dashboard verilerini yükle (eğer
