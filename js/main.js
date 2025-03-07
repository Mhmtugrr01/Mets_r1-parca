// Sayfa yüklendiğinde çalışacak
document.addEventListener('DOMContentLoaded', function() {
    // Giriş yapılmış mı kontrolü
    checkAuth();
    
    // Sayfa yönlendirmeleri için event listener
    setupEventListeners();
});

// Kimlik doğrulama kontrolü 
function checkAuth() {
    // Örnek: localStorage'dan token kontrolü
    const token = localStorage.getItem('auth_token');
    if (!token) {
        showLoginPage();
    } else {
        showMainApp();
    }
}

// Giriş işlemi
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Demo amaçlı basit kontrol
    if (username === 'demo' && password === 'demo123') {
        localStorage.setItem('auth_token', 'demo_token');
        showMainApp();
    } else {
        alert('Hatalı kullanıcı adı veya şifre!');
    }
}

// Login sayfasını göster
function showLoginPage() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
}

// Ana uygulamayı göster
function showMainApp() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
}

// Sayfa değiştirme
function showPage(pageId) {
    // Tüm sayfaları gizle
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // İlgili sayfayı göster
    const page = document.getElementById(pageId + '-page');
    if (page) {
        page.classList.add('active');
    }
    
    // Navbar'da aktif sayfayı işaretle
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    const navLink = document.querySelector(`.sidebar-link[onclick="showPage('${pageId}')"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
}

// Event listener'ları kur
function setupEventListeners() {
    // Çıkış işlemi için
    document.querySelector('.sidebar-user').addEventListener('click', function() {
        localStorage.removeItem('auth_token');
        showLoginPage();
    });
}
