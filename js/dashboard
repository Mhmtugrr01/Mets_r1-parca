/**
 * dashboard.js
 * Kontrol paneli işlevleri
 */

// Firestore referansı
const db = firebase.firestore();

// Kontrol paneli verilerini yükle
async function loadDashboardData() {
    try {
        // İstatistikleri yükle
        await loadDashboardStats();
        
        // Grafikleri çizdir
        drawCharts();
        
        // Aktif siparişleri yükle
        await loadActiveOrders();
        
        // Yaklaşan teslimleri yükle
        await loadUpcomingDeliveries();
        
        // Eksik malzemeleri yükle
        await loadMissingMaterials();
        
        console.log('Dashboard verileri başarıyla yüklendi');
    } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
    }
}

// İstatistik verilerini yükle
async function loadDashboardStats() {
    try {
        // Aktif siparişleri getir
        const activeOrdersSnapshot = await db.collection('orders')
            .where('status', '!=', 'completed')
            .get();
        
        // Eksik malzemeleri getir
        const missingMaterialsSnapshot = await db.collection('orders')
            .where('status', '==', 'waiting')
            .get();
        
        // Geciken işleri hesapla
        const today = new Date();
        let delayedOrdersCount = 0;
        
        activeOrdersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.deliveryDate) {
                const deliveryDate = new Date(data.deliveryDate.toDate());
                if (deliveryDate < today && data.status !== 'completed') {
                    delayedOrdersCount++;
                }
            }
        });
        
        // Bu ay teslim edilecekleri hesapla
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        let thisMonthDeliveryCount = 0;
        
        activeOrdersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.deliveryDate) {
                const deliveryDate = new Date(data.deliveryDate.toDate());
                if (deliveryDate.getMonth() === currentMonth && 
                    deliveryDate.getFullYear() === currentYear) {
                    thisMonthDeliveryCount++;
                }
            }
        });
        
        // İstatistikleri DOM'a yansıt
        document.querySelector('.stats-grid .stat-card:nth-child(1) .stat-value').textContent = activeOrdersSnapshot.size;
        document.querySelector('.stats-grid .stat-card:nth-child(2) .stat-value').textContent = missingMaterialsSnapshot.size;
        document.querySelector('.stats-grid .stat-card:nth-child(3) .stat-value').textContent = delayedOrdersCount;
        document.querySelector('.stats-grid .stat-card:nth-child(4) .stat-value').textContent = thisMonthDeliveryCount;
        
        return {
            activeOrders: activeOrdersSnapshot.size,
            missingMaterials: missingMaterialsSnapshot.size,
            delayedOrders: delayedOrdersCount,
            thisMonthDelivery: thisMonthDeliveryCount
        };
    } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
        throw error;
    }
}

// Grafik çizimi
function drawCharts() {
    // Sipariş ve teslimat verilerini al (normalde API'den alınacak)
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const orderData = [8, 13, 17, 19, 15, 12, 10, 14, 16, 20, 14, 11];
    const deliveryData = [7, 12, 16, 17, 14, 11, 9, 13, 15, 18, 13, 10];
    
    // Sipariş grafiği için Chart.js kullanımı
    const orderChartCanvas = document.getElementById('orderChart');
    if (orderChartCanvas) {
        const orderChart = new Chart(orderChartCanvas, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Siparişler',
                        data: orderData,
                        borderColor: '#1e40af',
                        backgroundColor: 'rgba(30, 64, 175, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Teslimler',
                        data: deliveryData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Aylık Sipariş ve Teslimat'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        console.warn('orderChart elementi bulunamadı');
    }
    
    // İlk çeyrekteki sipariş dağılımı için pasta grafik
    const customerChartCanvas = document.getElementById('customerChart');
    if (customerChartCanvas) {
        const customerChart = new Chart(customerChartCanvas, {
            type: 'doughnut',
            data: {
                labels: ['AYEDAŞ', 'ENERJİSA', 'BAŞKENT EDAŞ', 'TOROSLAR EDAŞ', 'Diğer'],
                datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: [
                        '#1e40af',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#6b7280'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: 'Müşterilere Göre Siparişler'
                    }
                }
            }
        });
    } else {
        console.warn('customerChart elementi bulunamadı');
    }
}

// Aktif siparişleri yükle
async function loadActiveOrders() {
    try {
        const ordersTableBody = document.querySelector('#orders-table tbody');
        
        // Yükleniyor göster
        ordersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Yükleniyor...</td></tr>';
        
        // Siparişleri getir
        const ordersSnapshot = await db.collection('orders')
            .where('status', '!=', 'completed')
            .orderBy('deliveryDate', 'asc')
            .limit(10)
            .get();
        
        if (ordersSnapshot.empty) {
            ordersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Aktif sipariş bulunamadı</td></tr>';
            return;
        }
        
        let ordersHTML = '';
        
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            const orderDate = order.orderDate ? new Date(order.orderDate.toDate()).toLocaleDateString('tr-TR') : '-';
            const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate.toDate()).toLocaleDateString('tr-TR') : '-';
            
            let statusClass = '';
            switch (order.status) {
                case 'waiting': statusClass = 'badge-warning'; break;
                case 'production': statusClass = 'badge-info'; break;
                case 'ready': statusClass = 'badge-success'; break;
                case 'planning': statusClass = 'badge-secondary'; break;
                default: statusClass = 'badge-info';
            }
            
            let statusText = '';
            switch (order.status) {
                case 'waiting': statusText = 'Malzeme Bekleniyor'; break;
                case 'production': statusText = 'Üretimde'; break;
                case 'ready': statusText = 'Malzeme Hazır'; break;
                case 'planning': statusText = 'Planlama'; break;
                default: statusText = 'Bilinmiyor';
            }
            
            let rowClass = '';
            if (order.hasMaterialIssue) rowClass = 'danger';
            else if (order.hasWarning) rowClass = 'warning';
            
            ordersHTML += `
                <tr onclick="showOrderDetail('${doc.id}')" class="${rowClass}">
                    <td>${order.orderNo || doc.id}</td>
                    <td>${order.customer || '-'}</td>
                    <td>${order.cellType || '-'}</td>
                    <td>${orderDate}</td>
                    <td>${deliveryDate}</td>
                    <td>${order.cellCount || 0}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        ordersTableBody.innerHTML = ordersHTML;
    } catch (error) {
        console.error('Aktif siparişler yüklenirken hata:', error);
        const ordersTableBody = document.querySelector('#orders-table tbody');
        ordersTableBody.innerHTML = `<tr><td colspan="8" class="text-center">Hata: ${error.message}</td></tr>`;
    }
}

// Yaklaşan teslimleri yükle
async function loadUpcomingDeliveries() {
    try {
        const today = new Date();
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);
        
        const upcomingDeliveriesTableBody = document.querySelector('#upcoming-deliveries-table tbody');
        
        // Yükleniyor göster
        if (upcomingDeliveriesTableBody) {
            upcomingDeliveriesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Yükleniyor...</td></tr>';
            
            // Yaklaşan teslimleri getir
            const deliveriesSnapshot = await db.collection('orders')
                .where('deliveryDate', '>', today)
                .where('deliveryDate', '<=', thirtyDaysLater)
                .where('status', '!=', 'completed')
                .orderBy('deliveryDate', 'asc')
                .limit(5)
                .get();
                
            if (deliveriesSnapshot.empty) {
                upcomingDeliveriesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Yaklaşan teslimat bulunamadı</td></tr>';
                return;
            }
            
            let deliveriesHTML = '';
            
            deliveriesSnapshot.forEach(doc => {
                const order = doc.data();
                const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate.toDate()).toLocaleDateString('tr-TR') : '-';
                
                // Kalan gün hesapla
                const remainingDays = order.deliveryDate ? 
                    Math.ceil((order.deliveryDate.toDate() - today) / (1000 * 60 * 60 * 24)) : 0;
                
                let statusClass = '';
                switch (order.status) {
                    case 'waiting': statusClass = 'badge-warning'; break;
                    case 'production': statusClass = 'badge-info'; break;
                    case 'ready': statusClass = 'badge-success'; break;
                    case 'planning': statusClass = 'badge-secondary'; break;
                    default: statusClass = 'badge-info';
                }
                
                let statusText = '';
                switch (order.status) {
                    case 'waiting': statusText = 'Malzeme Bekleniyor'; break;
                    case 'production': statusText = 'Üretimde'; break;
                    case 'ready': statusText = 'Malzeme Hazır'; break;
                    case 'planning': statusText = 'Planlama'; break;
                    default: statusText = 'Bilinmiyor';
                }
                
                deliveriesHTML += `
                    <tr onclick="showOrderDetail('${doc.id}')">
                        <td>${order.orderNo || doc.id}</td>
                        <td>${order.customer || '-'}</td>
                        <td>${deliveryDate}</td>
                        <td>${remainingDays}</td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                    </tr>
                `;
            });
            
            upcomingDeliveriesTableBody.innerHTML = deliveriesHTML;
        }
    } catch (error) {
        console.error('Yaklaşan teslimler yüklenirken hata:', error);
        const upcomingDeliveriesTableBody = document.querySelector('#upcoming-deliveries-table tbody');
        if (upcomingDeliveriesTableBody) {
            upcomingDeliveriesTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Hata: ${error.message}</td></tr>`;
        }
    }
}

// Eksik malzemeleri yükle
async function loadMissingMaterials() {
    try {
        const missingMaterialsTableBody = document.querySelector('#missing-materials-table tbody');
        
        if (missingMaterialsTableBody) {
            // Yükleniyor göster
            missingMaterialsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Yükleniyor...</td></tr>';
            
            // Eksik malzemeleri getir
            const materialsSnapshot = await db.collection('materials')
                .where('status', '==', 'missing')
                .orderBy('orderPriority', 'desc')
                .limit(5)
                .get();
                
            if (materialsSnapshot.empty) {
                missingMaterialsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Eksik malzeme bulunamadı</td></tr>';
                return;
            }
            
            let materialsHTML = '';
            
            materialsSnapshot.forEach(async doc => {
                const material = doc.data();
                
                // Tedarik tarihini formatlı göster
                const supplyDate = material.expectedSupplyDate ? 
                    new Date(material.expectedSupplyDate.toDate()).toLocaleDateString('tr-TR') : '-';
                
                // Gecikme durumunu hesapla
                let delayClass = 'badge-info';
                let delayText = 'Normal';
                
                if (material.expectedSupplyDate) {
                    const today = new Date();
                    const supplyDateObj = new Date(material.expectedSupplyDate.toDate());
                    const orderNeedDate = material.orderNeedDate ? new Date(material.orderNeedDate.toDate()) : null;
                    
                    if (orderNeedDate && supplyDateObj > orderNeedDate) {
                        delayClass = 'badge-danger';
                        delayText = 'Kritik';
                    } else if (supplyDateObj < today) {
                        delayClass = 'badge-warning';
                        delayText = 'Uyarı';
                    }
                }
                
                materialsHTML += `
                    <tr>
                        <td>${material.orderNo || '-'}</td>
                        <td>${material.name || '-'}</td>
                        <td><span class="badge badge-warning">Siparişte</span></td>
                        <td>${supplyDate}</td>
                        <td><span class="badge ${delayClass}">${delayText}</span></td>
                    </tr>
                `;
            });
            
            missingMaterialsTableBody.innerHTML = materialsHTML;
        }
    } catch (error) {
        console.error('Eksik malzemeler yüklenirken hata:', error);
        const missingMaterialsTableBody = document.querySelector('#missing-materials-table tbody');
        if (missingMaterialsTableBody) {
            missingMaterialsTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Hata: ${error.message}</td></tr>`;
        }
    }
}

// Verileri yenile
function refreshDashboardData() {
    // Yenileme animasyonu başlat
    const refreshBtn = document.querySelector('.page-header .btn-outline i');
    if (refreshBtn) {
        refreshBtn.classList.add('fa-spin');
    }
    
    // Verileri yenile
    loadDashboardData().then(() => {
        // Animasyonu durdur
        if (refreshBtn) {
            setTimeout(() => {
                refreshBtn.classList.remove('fa-spin');
            }, 500);
        }
    }).catch(error => {
        console.error('Veriler yenilenirken hata:', error);
        // Animasyonu durdur
        if (refreshBtn) {
            refreshBtn.classList.remove('fa-spin');
        }
    });
}

// Dashboard sayfası yüklendiğinde çalışacak kod
function initDashboard() {
    // Verileri yükle
    loadDashboardData();
    
    // Yenile butonuna tıklanınca
    const refreshBtn = document.querySelector('.page-header .btn-outline');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboardData);
    }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı oturum açmışsa
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Dashboard sayfası aktifse
            if (document.getElementById('dashboard-page').classList.contains('active')) {
                initDashboard();
            }
            
            // Sayfa değişimlerini izle
            document.querySelectorAll('.navbar-item').forEach(item => {
                item.addEventListener('click', function() {
                    const pageId = this.getAttribute('onclick').replace("showPage('", "").replace("')", "");
                    
                    if (pageId === 'dashboard') {
                        // Dashboard sayfasına geçildiğinde
                        setTimeout(() => {
                            initDashboard();
                        }, 100);
                    }
                });
            });
        }
    });
});
