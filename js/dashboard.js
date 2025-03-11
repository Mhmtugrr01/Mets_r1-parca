/**
 * dashboard.js
 * İyileştirilmiş Kontrol Paneli İşlevleri
 */

// Dashboard verilerini yükle
async function loadDashboardData() {
    try {
        console.log("Dashboard verileri yükleniyor...");
        
        // Loading göster
        toggleLoading(true, 'dashboard-page');
        
        // Paralel veri yükleme işlemleri
        const [stats, activeOrders, missingMaterials, upcomingDeliveries] = await Promise.all([
            loadDashboardStats(),
            loadActiveOrders(),
            loadMissingMaterials(),
            loadUpcomingDeliveries()
        ]);
        
        // Grafikleri çizdir
        drawCharts();
        
        // Loading gizle
        toggleLoading(false, 'dashboard-page');
        
        return {
            stats,
            activeOrders,
            missingMaterials,
            upcomingDeliveries
        };
    } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
        showToast('Dashboard verileri yüklenirken hata oluştu', 'error');
        
        // Loading gizle
        toggleLoading(false, 'dashboard-page');
        
        // Demo verileri yükle
        loadDashboardDemo();
    }
}

// Demo dashboard verileri
function loadDashboardDemo() {
    console.log("Demo dashboard verileri yükleniyor...");
    
    // Grafikleri çizdir
    drawCharts();
    
    // Aktif siparişleri yükle
    const ordersTableBody = document.querySelector('#orders-table tbody');
    if (ordersTableBody) {
        const demoOrders = [
            {
                id: 'order-1',
                orderNo: '24-03-A001',
                customer: 'AYEDAŞ',
                missingMaterials: 0,
                deliveryDate: '20.05.2024',
                orderDate: '15.02.2024',
                status: 'production',
                hasWarning: true
            },
            {
                id: 'order-2',
                orderNo: '24-03-B002',
                customer: 'BAŞKENT EDAŞ',
                missingMaterials: 2,
                deliveryDate: '15.05.2024',
                orderDate: '20.02.2024',
                status: 'waiting',
                hasMaterialIssue: true
            },
            {
                id: 'order-3',
                orderNo: '24-03-C003',
                customer: 'ENERJİSA',
                missingMaterials: 0,
                deliveryDate: '10.06.2024',
                orderDate: '25.02.2024',
                status: 'ready'
            },
            {
                id: 'order-4',
                orderNo: '24-04-D004',
                customer: 'TOROSLAR EDAŞ',
                missingMaterials: 0,
                deliveryDate: '25.06.2024',
                orderDate: '01.03.2024',
                status: 'planning'
            },
            {
                id: 'order-5',
                orderNo: '24-04-E005',
                customer: 'AYEDAŞ',
                missingMaterials: 0,
                deliveryDate: '10.07.2024',
                orderDate: '05.03.2024',
                status: 'planning'
            }
        ];
        
        let ordersHTML = '';
        
        demoOrders.forEach(order => {
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
                <tr onclick="showOrderDetail('${order.id}')" class="${rowClass}">
                    <td>${order.orderNo}</td>
                    <td>${order.customer}</td>
                    <td>${order.missingMaterials}</td>
                    <td>${order.deliveryDate}</td>
                    <td>${order.orderDate}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); showOrderDetail('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); editOrder('${order.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        ordersTableBody.innerHTML = ordersHTML;
    }
    
    // Yaklaşan teslimleri yükle
    const upcomingDeliveriesTableBody = document.querySelector('#upcoming-deliveries-table tbody');
    if (upcomingDeliveriesTableBody) {
        const demoDeliveries = [
            {
                orderNo: '24-03-B002',
                customer: 'BAŞKENT EDAŞ',
                deliveryDate: '15.05.2024',
                remainingDays: 7,
                status: 'waiting'
            },
            {
                orderNo: '24-03-A001',
                customer: 'AYEDAŞ',
                deliveryDate: '20.05.2024',
                remainingDays: 12,
                status: 'production'
            },
            {
                orderNo: '24-03-C003',
                customer: 'ENERJİSA',
                deliveryDate: '10.06.2024',
                remainingDays: 33,
                status: 'ready'
            }
        ];
        
        let deliveriesHTML = '';
        
        demoDeliveries.forEach(delivery => {
            // Durum sınıfını belirle
            let statusClass = '';
            switch (delivery.status) {
                case 'waiting': statusClass = 'badge-warning'; break;
                case 'production': statusClass = 'badge-info'; break;
                case 'ready': statusClass = 'badge-success'; break;
                case 'planning': statusClass = 'badge-secondary'; break;
                default: statusClass = 'badge-info';
            }
            
            // Durum metnini belirle
            let statusText = '';
            switch (delivery.status) {
                case 'waiting': statusText = 'Malzeme Bekleniyor'; break;
                case 'production': statusText = 'Üretimde'; break;
                case 'ready': statusText = 'Malzeme Hazır'; break;
                case 'planning': statusText = 'Planlama'; break;
                default: statusText = 'Bilinmiyor';
            }
            
            deliveriesHTML += `
                <tr>
                    <td>${delivery.orderNo}</td>
                    <td>${delivery.customer}</td>
                    <td>${delivery.deliveryDate}</td>
                    <td>${delivery.remainingDays} gün</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        });
        
        upcomingDeliveriesTableBody.innerHTML = deliveriesHTML;
    }
    
    // Eksik malzemeleri yükle
    const missingMaterialsTableBody = document.querySelector('#missing-materials-table tbody');
    if (missingMaterialsTableBody) {
        const demoMissingMaterials = [
            {
                orderNo: '24-03-B002',
                name: 'Kablo Başlıkları',
                status: 'Siparişte',
                supplyDate: '01.05.2024',
                priority: 'Kritik'
            },
            {
                orderNo: '24-03-B002',
                name: 'Gerilim Gösterge',
                status: 'Siparişte',
                supplyDate: '28.04.2024',
                priority: 'Uyarı'
            }
        ];
        
        let materialsHTML = '';
        
        demoMissingMaterials.forEach(material => {
            // Öncelik sınıfını belirle
            let priorityClass = '';
            switch (material.priority) {
                case 'Kritik': priorityClass = 'badge-danger'; break;
                case 'Uyarı': priorityClass = 'badge-warning'; break;
                case 'Normal': priorityClass = 'badge-info'; break;
                default: priorityClass = 'badge-info';
            }
            
            materialsHTML += `
                <tr>
                    <td>${material.orderNo}</td>
                    <td>${material.name}</td>
                    <td><span class="badge badge-warning">${material.status}</span></td>
                    <td>${material.supplyDate}</td>
                    <td><span class="badge ${priorityClass}">${material.priority}</span></td>
                </tr>
            `;
        });
        
        missingMaterialsTableBody.innerHTML = materialsHTML;
    }
}

// İstatistik verilerini yükle
async function loadDashboardStats() {
    try {
        // Firebase'den veri çekme
        if (firebase && firebase.firestore) {
            // Aktif siparişleri getir
            const activeOrdersQuery = firebase.firestore().collection('orders')
                .where('status', '!=', 'completed');
            
            // Eksik malzemeleri getir
            const missingMaterialsQuery = firebase.firestore().collection('materials')
                .where('inStock', '==', false);
            
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
        } else {
            // Demo veriler (Firebase yoksa)
            const statsData = {
                activeOrders: 24,
                missingMaterials: 8,
                delayedOrders: 3,
                thisMonthDelivery: 12
            };
            
            // İstatistikleri DOM'a yansıt
            updateStatCards(statsData);
            
            return statsData;
        }
    } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
        
        // Demo veriler (Hata durumunda)
        const statsData = {
            activeOrders: 24,
            missingMaterials: 8,
            delayedOrders: 3,
            thisMonthDelivery: 12
        };
        
        // İstatistikleri DOM'a yansıt
        updateStatCards(statsData);
        
        return statsData;
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
function drawCharts() {
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
                        text: 'Aylık Sipariş ve Teslimat',
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
                    }
                },
                cutout: '60%'
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
        ordersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Yükleniyor...</td></tr>';
        
        // Firebase var mı kontrol et
        if (firebase && firebase.firestore) {
            // Siparişleri getir
            const ordersSnapshot = await firebase.firestore().collection('orders')
                .where('status', '!=', 'completed')
                .orderBy('deliveryDate', 'asc')
                .limit(10)
                .get();
            
            if (ordersSnapshot.empty) {
                ordersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Aktif sipariş bulunamadı</td></tr>';
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
                    formatDate(order.orderDate) : '-';
                
                const deliveryDate = order.deliveryDate ? 
                    formatDate(order.deliveryDate) : '-';
                
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
                            <button class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem;" onclick="event.stopPropagation(); showOrderDetail('${order.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem;" onclick="event.stopPropagation(); editOrder('${order.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            ordersTableBody.innerHTML = ordersHTML;
            return orders;
        } else {
            // Firebase yoksa demo verileri kullan
            const demoOrders = [
                {
                    id: 'order-1',
                    orderNo: '24-03-A001',
                    customer: 'AYEDAŞ',
                    missingMaterials: 0,
                    deliveryDate: '10.07.2024',
                    orderDate: '05.03.2024',
                    status: 'planning'
                }
            ];
            
            let ordersHTML = '';
            
            demoOrders.forEach(order => {
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
                    <tr onclick="showOrderDetail('${order.id}')" class="${rowClass}">
                        <td>${order.orderNo}</td>
                        <td>${order.customer}</td>
                        <td>${order.missingMaterials}</td>
                        <td>${order.deliveryDate}</td>
                        <td>${order.orderDate}</td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                        <td>
                            <button class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem;" onclick="event.stopPropagation(); showOrderDetail('${order.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem;" onclick="event.stopPropagation(); editOrder('${order.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            ordersTableBody.innerHTML = ordersHTML;
            return demoOrders;
        }
    } catch (error) {
        console.error('Aktif siparişler yüklenirken hata:', error);
        const ordersTableBody = document.querySelector('#orders-table tbody');
        if (ordersTableBody) {
            ordersTableBody.innerHTML = `<tr><td colspan="7" class="text-center">Hata: ${error.message}</td></tr>`;
        }
        
        // Hata durumunda demo verileri yükle
        setTimeout(() => loadDashboardDemo(), 500);
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
        
        // Firebase var mı kontrol et
        if (firebase && firebase.firestore) {
            // Eksik malzemeleri getir
            const materialsSnapshot = await firebase.firestore().collection('materials')
                .where('inStock', '==', false)
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
                    formatDate(material.expectedSupplyDate) : '-';
                
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
        } else {
            // Firebase yoksa demo verileri kullan
            const demoMissingMaterials = [
                {
                    orderNo: '24-03-B002',
                    name: 'Kablo Başlıkları',
                    status: 'Siparişte',
                    supplyDate: '01.05.2024',
                    priority: 'Kritik'
                },
                {
                    orderNo: '24-03-B002',
                    name: 'Gerilim Gösterge',
                    status: 'Siparişte',
                    supplyDate: '28.04.2024',
                    priority: 'Uyarı'
                }
            ];
            
            let materialsHTML = '';
            
            demoMissingMaterials.forEach(material => {
                // Öncelik sınıfını belirle
                let priorityClass = '';
                switch (material.priority) {
                    case 'Kritik': priorityClass = 'badge-danger'; break;
                    case 'Uyarı': priorityClass = 'badge-warning'; break;
                    case 'Normal': priorityClass = 'badge-info'; break;
                    default: priorityClass = 'badge-info';
                }
                
                materialsHTML += `
                    <tr>
                        <td>${material.orderNo}</td>
                        <td>${material.name}</td>
                        <td><span class="badge badge-warning">${material.status}</span></td>
                        <td>${material.supplyDate}</td>
                        <td><span class="badge ${priorityClass}">${material.priority}</span></td>
                    </tr>
                `;
            });
            
            missingMaterialsTableBody.innerHTML = materialsHTML;
            return demoMissingMaterials;
        }
    } catch (error) {
        console.error('Eksik malzemeler yüklenirken hata:', error);
        const missingMaterialsTableBody = document.querySelector('#missing-materials-table tbody');
        if (missingMaterialsTableBody) {
            missingMaterialsTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Hata: ${error.message}</td></tr>`;
        }
        
        // Hata durumunda demo verileri kullan
        const demoMissingMaterials = [
            {
                orderNo: '24-03-B002',
                name: 'Kablo Başlıkları',
                status: 'Siparişte',
                supplyDate: '01.05.2024',
                priority: 'Kritik'
            },
            {
                orderNo: '24-03-B002',
                name: 'Gerilim Gösterge',
                status: 'Siparişte',
                supplyDate: '28.04.2024',
                priority: 'Uyarı'
            }
        ];
        
        return demoMissingMaterials;
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
        
        // Firebase var mı kontrol et
        if (firebase && firebase.firestore) {
            // Yaklaşan teslimleri getir
            const today = new Date();
            const thirtyDaysLater = new Date(today);
            thirtyDaysLater.setDate(today.getDate() + 30);
            
            const deliveriesSnapshot = await firebase.firestore().collection('orders')
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
                    formatDate(order.deliveryDate) : '-';
                
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
        } else {
            // Firebase yoksa demo veriler
            const demoDeliveries = [
                {
                    orderNo: '24-03-B002',
                    customer: 'BAŞKENT EDAŞ',
                    deliveryDate: '15.05.2024',
                    remainingDays: 7,
                    status: 'waiting'
                },
                {
                    orderNo: '24-03-A001',
                    customer: 'AYEDAŞ',
                    deliveryDate: '20.05.2024',
                    remainingDays: 12,
                    status: 'production'
                },
                {
                    orderNo: '24-03-C003',
                    customer: 'ENERJİSA',
                    deliveryDate: '10.06.2024',
                    remainingDays: 33,
                    status: 'ready'
                }
            ];
            
            let deliveriesHTML = '';
            
            demoDeliveries.forEach(delivery => {
                // Durum sınıfını belirle
                let statusClass = '';
                switch (delivery.status) {
                    case 'waiting': statusClass = 'badge-warning'; break;
                    case 'production': statusClass = 'badge-info'; break;
                    case 'ready': statusClass = 'badge-success'; break;
                    case 'planning': statusClass = 'badge-secondary'; break;
                    default: statusClass = 'badge-info';
                }
                
                // Durum metnini belirle
                let statusText = '';
                switch (delivery.status) {
                    case 'waiting': statusText = 'Malzeme Bekleniyor'; break;
                    case 'production': statusText = 'Üretimde'; break;
                    case 'ready': statusText = 'Malzeme Hazır'; break;
                    case 'planning': statusText = 'Planlama'; break;
                    default: statusText = 'Bilinmiyor';
                }
                
                deliveriesHTML += `
                    <tr>
                        <td>${delivery.orderNo}</td>
                        <td>${delivery.customer}</td>
                        <td>${delivery.deliveryDate}</td>
                        <td>${delivery.remainingDays} gün</td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                    </tr>
                `;
            });
            
            upcomingDeliveriesTableBody.innerHTML = deliveriesHTML;
            return demoDeliveries;
        }
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
}

// Sipariş detayını göster 
function showOrderDetail(orderId) {
    if (typeof window.showOrderDetail === 'function') {
        window.showOrderDetail(orderId);
    } else {
        // Kendi fonksiyonumuzu tanımlayalım
        const modal = document.getElementById('order-detail-modal');
        const idSpan = document.getElementById('order-detail-id');
        
        if (modal && idSpan) {
            idSpan.textContent = orderId;
            modal.style.display = 'block';
            
            // Demo veriler yükle
            setTimeout(() => {
                document.querySelector('#order-general input[name="orderNo"]').value = `24-03-${orderId.substring(0, 4).toUpperCase()}`;
                document.querySelector('#order-general input[name="customer"]').value = "AYEDAŞ";
                document.querySelector('#order-general input[name="cellType"]').value = "RM 36 LB";
                document.querySelector('#order-general input[name="cellCount"]').value = "3";
                document.querySelector('#order-general input[name="orderDate"]').value = "15.02.2024";
                document.querySelector('#order-general input[name="deliveryDate"]').value = "20.05.2024";
                document.querySelector('#order-general select[name="status"]').value = "production";
                
                // İş akışı durumunu güncelle
                updateWorkflowStatus("production");
            }, 300);
        }
    }
}

// Formatlanmış bir şekilde tarih içerisindeki fonksiyonu çağır
function formatDate(date) {
    if (window.formatDate && typeof window.formatDate === 'function') {
        return window.formatDate(date);
    }
    
    // Kendi formatDate fonksiyonumuzu tanımlayalım
    if (!date) return '';
    
    if (typeof date === 'string') {
        // ISO formatında ise
        if (date.includes('T')) {
            date = new Date(date);
        } else if (date.includes('.')) {
            // TR formatında (12.05.2024) ise
            return date; // Zaten formatlı
        } else if (date.includes('/')) {
            // US formatında (05/12/2024) ise
            const parts = date.split('/');
            if (parts.length === 3) {
                return `${parts[1]}.${parts[0]}.${parts[2]}`;
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
}singMaterials: 0,
                    deliveryDate: '20.05.2024',
                    orderDate: '15.02.2024',
                    status: 'production',
                    hasWarning: true
                },
                {
                    id: 'order-2',
                    orderNo: '24-03-B002',
                    customer: 'BAŞKENT EDAŞ',
                    missingMaterials: 2,
                    deliveryDate: '15.05.2024',
                    orderDate: '20.02.2024',
                    status: 'waiting',
                    hasMaterialIssue: true
                },
                {
                    id: 'order-3',
                    orderNo: '24-03-C003',
                    customer: 'ENERJİSA',
                    missingMaterials: 0,
                    deliveryDate: '10.06.2024',
                    orderDate: '25.02.2024',
                    status: 'ready'
                },
                {
                    id: 'order-4',
                    orderNo: '24-04-D004',
                    customer: 'TOROSLAR EDAŞ',
                    missingMaterials: 0,
                    deliveryDate: '25.06.2024',
                    orderDate: '01.03.2024',
                    status: 'planning'
                },
                {
                    id: 'order-5',
                    orderNo: '24-04-E005',
                    customer: 'AYEDAŞ',
                    mis
