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
