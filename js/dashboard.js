/**
 * dashboard.js
 * İyileştirilmiş Kontrol Paneli İşlevleri
 */

// Dashboard verilerini yükle
async function loadDashboardData() {
    try {
        toggleLoading(true, 'dashboard-page');
        
        // Paralel veri yükleme işlemleri
        const [stats, activeOrders, missingMaterials, upcomingDeliveries] = await Promise.all([
            loadDashboardStats(),
            loadActiveOrders(),
            loadMissingMaterials(),
            loadUpcomingDeliveries()
        ]);
        
        // Grafikleri çizdir
        drawCharts(stats);
        
        showToast('Dashboard verileri güncellendi', 'success', 2000);
        
        return {
            stats,
            activeOrders,
            missingMaterials,
            upcomingDeliveries
        };
    } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
        showToast('Dashboard verileri yüklenirken hata oluştu', 'error');
        showErrorSection('dashboard-page', 'Veriler yüklenemedi', 'Lütfen internet bağlantınızı kontrol edin ve sayfayı yenileyin.');
    } finally {
        toggleLoading(false, 'dashboard-page');
    }
}

// İstatistik verilerini yükle
async function loadDashboardStats() {
    try {
        // Aktif siparişleri getir
        const activeOrdersQuery = firebase.db.collection('orders')
            .where('status', '!=', 'completed');
        
        // Eksik malzemeleri getir
        const missingMaterialsQuery = firebase.db.collection('orders')
            .where('status', '==', 'waiting');
        
        // Paralel sorgu çalıştırma
        const [activeOrdersSnapshot, missingMaterialsSnapshot] = await Promise.all([
            activeOrdersQuery.get(),
            missingMaterialsQuery.get()
        ]);
        
        // Geciken işleri hesapla
        const today = new Date();
        let delayedOrdersCount = 0;
        let thisMonthDeliveryCount = 0;
        
        // Aktif siparişleri analiz et
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        activeOrdersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.deliveryDate) {
                const deliveryDate = data.deliveryDate.toDate ? data.deliveryDate.toDate() : new Date(data.deliveryDate);
                
                // Geciken siparişler
                if (deliveryDate < today && data.status !== 'completed') {
                    delayedOrdersCount++;
                }
                
                // Bu ay teslim edilecekler
                if (deliveryDate.getMonth() === currentMonth && 
                    deliveryDate.getFullYear() === currentYear) {
                    thisMonthDeliveryCount++;
                }
            }
        });
        
        // İstatistik verileri
        const statsData = {
            activeOrders: activeOrdersSnapshot.size,
            missingMaterials: missingMaterialsSnapshot.size,
            delayedOrders: delayedOrdersCount,
            thisMonthDelivery: thisMonthDeliveryCount
        };
        
        // İstatistikleri DOM'a yansıt
        updateStatCards(statsData);
        
        return statsData;
    } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
        throw error;
    }
}

// Stat kartlarını güncelle
function updateStatCards(stats) {
    // Aktif siparişler
    const activeOrdersElement = document.querySelector('.stats-grid .stat-card:nth-child(1) .stat-value');
    if (activeOrdersElement) {
        activeOrdersElement.textContent = stats.activeOrders;
    }
    
    // Eksik malzemeler
    const missingMaterialsElement = document.querySelector('.stats-grid .stat-card:nth-child(2) .stat-value');
    if (missingMaterialsElement) {
        missingMaterialsElement.textContent = stats.missingMaterials;
    }
    
    // Geciken işler
    const delayedOrdersElement = document.querySelector('.stats-grid .stat-card:nth-child(3) .stat-value');
    if (delayedOrdersElement) {
        delayedOrdersElement.textContent = stats.delayedOrders;
    }
    
    // Bu ay teslimler
    const thisMonthDeliveryElement = document.querySelector('.stats-grid .stat-card:nth-child(4) .stat-value');
    if (thisMonthDeliveryElement) {
        thisMonthDeliveryElement.textContent = stats.thisMonthDelivery;
    }
}

// Grafik çizimi
function drawCharts(statsData) {
    // Sipariş ve teslimat verilerini al (normalde API'den alınacak)
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const orderData = [8, 13, 17, 19, 15, 12, 10, 14, 16, 20, 14, 11];
    const deliveryData = [7, 12, 16, 17, 14, 11, 9, 13, 15, 18, 13, 10];
    
    // Sipariş grafiği için Chart.js kullanımı
    const orderChartCanvas = document.getElementById('orderChart');
    if (orderChartCanvas) {
        // Önceki grafiği temizle
        if (window.orderChart) {
            window.orderChart.destroy();
        }
        
        window.orderChart = new Chart(orderChartCanvas, {
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
                        text: 'Sipariş Durumlarına Göre Dağılım',
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Sipariş Sayısı'
                        }
                    }
                }
            }
        });
    }
}

// Aktif siparişleri yükle
async function loadActiveOrders() {
    try {
        const ordersTableBody = document.querySelector('#orders-table tbody');
        if (!ordersTableBody) {
            console.warn('Sipariş tablosu bulunamadı');
            return [];
        }
        
        // Yükleniyor göster
        ordersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Yükleniyor...</td></tr>';
        
        // Siparişleri getir
        const ordersSnapshot = await firebase.db.collection('orders')
            .where('status', '!=', 'completed')
            .orderBy('deliveryDate', 'asc')
            .limit(10)
            .get();
        
        if (ordersSnapshot.empty) {
            ordersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Aktif sipariş bulunamadı</td></tr>';
            return [];
        }
        
        // Siparişleri işle
        const orders = [];
        ordersSnapshot.forEach(doc => {
            orders.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sipariş tablosunu doldur
        let ordersHTML = '';
        
        orders.forEach(order => {
            const orderDate = order.orderDate ? 
                new Date(order.orderDate.toDate ? order.orderDate.toDate() : order.orderDate).toLocaleDateString('tr-TR') : '-';
            
            const deliveryDate = order.deliveryDate ? 
                new Date(order.deliveryDate.toDate ? order.deliveryDate.toDate() : order.deliveryDate).toLocaleDateString('tr-TR') : '-';
            
            // Durum sınıfını belirle
            let statusClass = '';
            switch (order.status) {
                case 'waiting': statusClass = 'badge-warning'; break;
                case 'production': statusClass = 'badge-info'; break;
                case 'ready': statusClass = 'badge-success'; break;
                case 'planning': statusClass = 'badge-secondary'; break;
                default: statusClass = 'badge-info';
            }
            
            // Durum metnini belirle
            let statusText = '';
            switch (order.status) {
                case 'waiting': statusText = 'Malzeme Bekleniyor'; break;
                case 'production': statusText = 'Üretimde'; break;
                case 'ready': statusText = 'Malzeme Hazır'; break;
                case 'planning': statusText = 'Planlama'; break;
                default: statusText = 'Bilinmiyor';
            }
            
            // Satır sınıfını belirle
            let rowClass = '';
            if (order.hasMaterialIssue) rowClass = 'danger';
            else if (order.hasWarning) rowClass = 'warning';
            
            ordersHTML += `
                <tr onclick="showOrderDetail('${doc.id}')" class="${rowClass}">
                    <td>${order.orderNo || '-'}</td>
                    <td>${order.customer || '-'}</td>
                    <td>${order.missingMaterials || 0}</td>
                    <td>${deliveryDate}</td>
                    <td>${orderDate}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" onclick="event.stopPropagation(); showOrderDetail('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem;" onclick="event.stopPropagation(); editOrder('${order.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        ordersTableBody.innerHTML = ordersHTML;
        return orders;
    } catch (error) {
        console.error('Aktif siparişler yüklenirken hata:', error);
        const ordersTableBody = document.querySelector('#orders-table tbody');
        if (ordersTableBody) {
            ordersTableBody.innerHTML = `<tr><td colspan="8" class="text-center">Hata: ${error.message}</td></tr>`;
        }
        throw error;
    }
}

// Eksik malzemeleri yükle
async function loadMissingMaterials() {
    try {
        const missingMaterialsTableBody = document.querySelector('#missing-materials-table tbody');
        if (!missingMaterialsTableBody) {
            console.warn('Eksik malzemeler tablosu bulunamadı');
            return [];
        }
        
        // Yükleniyor göster
        missingMaterialsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Yükleniyor...</td></tr>';
        
        // Eksik malzemeleri getir
        const materialsSnapshot = await firebase.db.collection('materials')
            .where('status', '==', 'missing')
            .orderBy('orderPriority', 'desc')
            .limit(5)
            .get();
        
        if (materialsSnapshot.empty) {
            missingMaterialsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Eksik malzeme bulunamadı</td></tr>';
            return [];
        }
        
        // Malzemeleri işle
        const materials = [];
        materialsSnapshot.forEach(doc => {
            materials.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Malzeme tablosunu doldur
        let materialsHTML = '';
        
        materials.forEach(material => {
            // Tedarik tarihini formatlı göster
            const supplyDate = material.expectedSupplyDate ? 
                new Date(material.expectedSupplyDate.toDate ? material.expectedSupplyDate.toDate() : material.expectedSupplyDate).toLocaleDateString('tr-TR') : '-';
            
            // Gecikme durumunu hesapla
            let delayClass = 'badge-info';
            let delayText = 'Normal';
            
            if (material.expectedSupplyDate) {
                const today = new Date();
                const supplyDateObj = new Date(material.expectedSupplyDate.toDate ? material.expectedSupplyDate.toDate() : material.expectedSupplyDate);
                const orderNeedDate = material.orderNeedDate ? 
                    new Date(material.orderNeedDate.toDate ? material.orderNeedDate.toDate() : material.orderNeedDate) : null;
                
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
        return materials;
    } catch (error) {
        console.error('Eksik malzemeler yüklenirken hata:', error);
        const missingMaterialsTableBody = document.querySelector('#missing-materials-table tbody');
        if (missingMaterialsTableBody) {
            missingMaterialsTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Hata: ${error.message}</td></tr>`;
        }
        throw error;
    }
}

// Yaklaşan teslimleri yükle
async function loadUpcomingDeliveries() {
    try {
        const upcomingDeliveriesTableBody = document.querySelector('#upcoming-deliveries-table tbody');
        if (!upcomingDeliveriesTableBody) {
            console.warn('Yaklaşan teslimler tablosu bulunamadı');
            return [];
        }
        
        // Yükleniyor göster
        upcomingDeliveriesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Yükleniyor...</td></tr>';
        
        // Yaklaşan teslimleri getir
        const today = new Date();
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);
        
        const deliveriesSnapshot = await firebase.db.collection('orders')
            .where('deliveryDate', '>', today)
            .where('deliveryDate', '<=', thirtyDaysLater)
            .where('status', '!=', 'completed')
            .orderBy('deliveryDate', 'asc')
            .limit(5)
            .get();
        
        if (deliveriesSnapshot.empty) {
            upcomingDeliveriesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Yaklaşan teslimat bulunamadı</td></tr>';
            return [];
        }
        
        // Teslimleri işle
        const deliveries = [];
        deliveriesSnapshot.forEach(doc => {
            deliveries.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Teslimat tablosunu doldur
        let deliveriesHTML = '';
        
        deliveries.forEach(order => {
            const deliveryDate = order.deliveryDate ? 
                new Date(order.deliveryDate.toDate ? order.deliveryDate.toDate() : order.deliveryDate).toLocaleDateString('tr-TR') : '-';
            
            // Kalan gün hesapla
            const remainingDays = order.deliveryDate ? 
                Math.ceil((new Date(order.deliveryDate.toDate ? order.deliveryDate.toDate() : order.deliveryDate) - today) / (1000 * 60 * 60 * 24)) : 0;
            
            // Durum sınıfını belirle
            let statusClass = '';
            switch (order.status) {
                case 'waiting': statusClass = 'badge-warning'; break;
                case 'production': statusClass = 'badge-info'; break;
                case 'ready': statusClass = 'badge-success'; break;
                case 'planning': statusClass = 'badge-secondary'; break;
                default: statusClass = 'badge-info';
            }
            
            // Durum metnini belirle
            let statusText = '';
            switch (order.status) {
                case 'waiting': statusText = 'Malzeme Bekleniyor'; break;
                case 'production': statusText = 'Üretimde'; break;
                case 'ready': statusText = 'Malzeme Hazır'; break;
                case 'planning': statusText = 'Planlama'; break;
                default: statusText = 'Bilinmiyor';
            }
            
            deliveriesHTML += `
                <tr onclick="showOrderDetail('${order.id}')">
                    <td>${order.orderNo || '-'}</td>
                    <td>${order.customer || '-'}</td>
                    <td>${deliveryDate}</td>
                    <td>${remainingDays} gün</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        });
        
        upcomingDeliveriesTableBody.innerHTML = deliveriesHTML;
        return deliveries;
    } catch (error) {
        console.error('Yaklaşan teslimler yüklenirken hata:', error);
        const upcomingDeliveriesTableBody = document.querySelector('#upcoming-deliveries-table tbody');
        if (upcomingDeliveriesTableBody) {
            upcomingDeliveriesTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Hata: ${error.message}</td></tr>`;
        }
        throw error;
    }
}

// Hata bölümünü göster
function showErrorSection(containerId, title, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const errorHTML = `
        <div class="error-section">
            <div class="card">
                <div class="card-body text-center" style="padding: 2rem;">
                    <div style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 style="margin-bottom: 1rem;">${title}</h3>
                    <p style="margin-bottom: 1.5rem;">${message}</p>
                    <button class="btn btn-primary" onclick="refreshData()">
                        <i class="fas fa-sync-alt"></i> Yeniden Dene
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Hata bölümünü ekle
    container.insertAdjacentHTML('beforeend', errorHTML);
}: true,
                        text: 'Aylık Sipariş ve Teslimat'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Sipariş Sayısı'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Ay'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                    axis: 'x'
                }
            }
        });
    }
    
    // Müşteri dağılımı için pasta grafik
    const customerChartCanvas = document.getElementById('customerChart');
    if (customerChartCanvas) {
        // Önceki grafiği temizle
        if (window.customerChart) {
            window.customerChart.destroy();
        }
        
        window.customerChart = new Chart(customerChartCanvas, {
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
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            boxWidth: 12
                        }
                    },
                    title: {
                        display: true,
                        text: 'Müşterilere Göre Siparişler',
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.formattedValue || '';
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
    
    // Üretim durumu grafiği (yeni)
    const productionStatusCanvas = document.getElementById('productionStatusChart');
    if (productionStatusCanvas) {
        // Önceki grafiği temizle
        if (window.productionStatusChart) {
            window.productionStatusChart.destroy();
        }
        
        window.productionStatusChart = new Chart(productionStatusCanvas, {
            type: 'bar',
            data: {
                labels: ['Planlama', 'Malzeme Bekliyor', 'Üretimde', 'Test', 'Tamamlandı'],
                datasets: [{
                    label: 'Sipariş Sayısı',
                    data: [3, 8, 12, 5, 22],
                    backgroundColor: [
                        'rgba(100, 116, 139, 0.7)',  // Planlama - Gri
                        'rgba(245, 158, 11, 0.7)',   // Malzeme Bekliyor - Turuncu
                        'rgba(14, 165, 233, 0.7)',   // Üretimde - Mavi
                        'rgba(234, 179, 8, 0.7)',    // Test - Sarı
                        'rgba(16, 185, 129, 0.7)'    // Tamamlandı - Yeşil
                    ],
                    borderColor: [
                        'rgb(100, 116, 139)',
                        'rgb(245, 158, 11)',
                        'rgb(14, 165, 233)',
                        'rgb(234, 179, 8)',
                        'rgb(16, 185, 129)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display
