/**
 * Firebase Uyumluluk Kontrolü
 * Bu script, Firebase SDK'larının düzgün yüklenip yüklenmediğini kontrol eder.
 */

function checkFirebaseCompatibility() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK yüklenemedi. İnternet bağlantınızı kontrol edin ve sayfayı yenileyin.');
    showErrorMessage('Firebase SDK yüklenemedi. İnternet bağlantınızı kontrol edin ve sayfayı yenileyin.');
    return false;
  }

  const requiredServices = [
    { name: 'auth', displayName: 'Firebase Authentication' },
    { name: 'firestore', displayName: 'Firestore' }
  ];

  let allServicesLoaded = true;

  for (const service of requiredServices) {
    if (typeof firebase[service.name] === 'undefined') {
      console.error(`${service.displayName} yüklenemedi.`);
      allServicesLoaded = false;
    }
  }

  if (!allServicesLoaded) {
    showErrorMessage('Bazı Firebase bileşenleri yüklenemedi. Sayfayı yenileyin veya yöneticinize başvurun.');
    return false;
  }

  return true;
}

// Hata mesajını kullanıcıya göster
function showErrorMessage(message) {
  // Sayfa yüklendiyse özel hata mesajı göster
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
    errorBox.innerHTML = `
      <div>${message}</div>
      <button onclick="location.reload()" style="margin-top:8px;padding:5px 10px;background:#dc3545;color:white;border:none;border-radius:4px;cursor:pointer;">Sayfayı Yenile</button>
    `;
    
    document.body.prepend(errorBox);
  } else {
    // Sayfa yüklenmedi, event listener ekle
    window.addEventListener('DOMContentLoaded', () => {
      showErrorMessage(message);
    });
  }
}

// Sayfa yüklendiğinde uyumluluk kontrolü yap
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    // Sayfa yüklendikten 2 saniye sonra kontrol et (tüm script'lerin yüklenmesi için)
    checkFirebaseCompatibility();
  }, 2000);
});
