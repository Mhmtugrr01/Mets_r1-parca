/**
 * Performans raporu oluştur
 * @param {Array} orders - Sipariş verileri
 * @param {Array} production - Üretim verileri
 * @param {string} timeframe - Zaman çerçevesi
 * @returns {string} Oluşturulan yanıt
 */
function generatePerformanceReport(orders, production, timeframe) {
    // Zaman çerçevesine göre filtreleme
    const filteredOrders = filterOrdersByTimeframe(orders, timeframe);
    const filteredProduction = filterProductionByTimeframe(production, timeframe);
    
    // Siparişlerde zamanında teslim oranı
    const completedOrders = filteredOrders.filter(o => o.status === 'completed');
    const delayedOrders = filteredOrders.filter(o => isOrderDelayed(o));
    let onTimeDeliveryRate = 0;
    
    if (completedOrders.length > 0) {
        const onTimeOrders = completedOrders.filter(o => !isOrderDelayed(o));
        onTimeDeliveryRate = Math.round((onTimeOrders.length / completedOrders.length) * 100) || 0;
    }
    
    // Üretimde zamanında tamamlama oranı
    const completedProduction = filteredProduction.filter(p => p.status === 'completed');
    const delayedProduction = filteredProduction.filter(p => p.isDelayed);
    let onTimeProductionRate = 0;
    
    if (completedProduction.length > 0) {
        const onTimeProduction = completedProduction.filter(p => !p.isDelayed);
        onTimeProductionRate = Math.round((onTimeProduction.length / completedProduction.length) * 100) || 0;
    }
    
    // Departman performansı - Sipariş durumlarına göre
    const departmentPerformance = {
        'sales': {
            total: filteredOrders.length,
            onTime: filteredOrders.filter(o => !isOrderDelayed(o)).length
        },
        'production': {
            total: filteredProduction.length,
            onTime: filteredProduction.filter(p => !p.isDelayed).length
        },
        'purchasing': {
            total: 0,
            onTime: 0
        }
    };
    
    // Rapor başlığı
    const timeframeText = getTimeframeText(timeframe);
    let response = `<strong>${timeframeText} Performans Raporu</strong><br><br>`;
    
    // Özet bilgiler
    response += `<div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between;">
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Toplam Sipariş</div>
                <div style="font-size: 24px; font-weight: bold; color: #0f172a;">${filteredOrders.length}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Zamanında Teslimat</div>
                <div style="font-size: 24px; font-weight: bold; color: #10b981;">${onTimeDeliveryRate}%</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Üretim Performansı</div>
                <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${onTimeProductionRate}%</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Geciken Sipariş</div>
                <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${delayedOrders.length}</div>
            </div>
        </div>
    </div>`;
    
    // Performans göstergeleri
    response += `<strong>Genel Performans Göstergeleri:</strong><br><br>`;
    
    response += `<div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1; min-width: 200px; padding: 15px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${onTimeDeliveryRate}%</div>
            <div style="font-size: 14px; color: #64748b;">Zamanında Teslimat Oranı</div>
            <div style="margin-top: 10px; height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${onTimeDeliveryRate}%; background-color: ${getPerformanceColor(onTimeDeliveryRate)};"></div>
            </div>
        </div>
        <div style="flex: 1; min-width: 200px; padding: 15px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${onTimeProductionRate}%</div>
            <div style="font-size: 14px; color: #64748b;">Üretim Başarı Oranı</div>
            <div style="margin-top: 10px; height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${onTimeProductionRate}%; background-color: ${getPerformanceColor(onTimeProductionRate)};"></div>
            </div>
        </div>
    </div>`;
    
    // Departman performansları
    response += `<br><strong>Departman Performansları:</strong><br><br>`;
    
    // Departman performans tablosu
    response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f8fafc;">
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Departman</th>
            <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Başarı Oranı</th>
            <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Toplam İşlem</th>
            <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Başarılı</th>
        </tr>`;
    
    Object.entries(departmentPerformance).forEach(([department, data]) => {
        if (data.total > 0) {
            const successRate = Math.round((data.onTime / data.total) * 100) || 0;
            const performanceColor = getPerformanceColor(successRate);
            
            // Departman isimleri
            const departmentNames = {
                'sales': 'Satış',
                'production': 'Üretim',
                'purchasing': 'Satın Alma'
            };
            
            response += `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${departmentNames[department] || department}</td>
                <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center;">
                        <div style="flex: 1; height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden; margin-right: 8px;">
                            <div style="height: 100%; width: ${successRate}%; background-color: ${performanceColor};"></div>
                        </div>
                        <div style="width: 40px; text-align: right; color: ${performanceColor}; font-weight: bold;">${successRate}%</div>
                    </div>
                </td>
                <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">${data.total}</td>
                <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">${data.onTime}</td>
            </tr>`;
        }
    });
    
    response += `</table></div>`;
    
    // Trendler - son üç dönem karşılaştırması
    response += `<br><strong>Performans Trendleri:</strong><br><br>`;
    
    // Örnek trend verileri (gerçek verilerle değiştirilmeli)
    const trendData = {
        periods: ['Geçen Ay', '2 Ay Önce', '3 Ay Önce'],
        deliveryRates: [onTimeDeliveryRate, onTimeDeliveryRate - 5, onTimeDeliveryRate - 10],
        productionRates: [onTimeProductionRate, onTimeProductionRate - 3, onTimeProductionRate - 7]
    };
    
    // Trend grafiği (yatay çubuk)
    response += `<div style="margin-bottom: 20px;">`;
    
    trendData.periods.forEach((period, index) => {
        const deliveryRate = trendData.deliveryRates[index];
        const productionRate = trendData.productionRates[index];
        
        response += `<div style="margin-bottom: 15px;">
            <div style="font-size: 14px; margin-bottom: 5px;">${period}</div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                <div style="width: 100px; text-align: right; font-size: 12px;">Teslimat:</div>
                <div style="flex: 1; height: 16px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${deliveryRate}%; background-color: ${getPerformanceColor(deliveryRate)};"></div>
                </div>
                <div style="width: 40px; text-align: right; font-size: 12px; font-weight: bold;">${deliveryRate}%</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 100px; text-align: right; font-size: 12px;">Üretim:</div>
                <div style="flex: 1; height: 16px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${productionRate}%; background-color: ${getPerformanceColor(productionRate)};"></div>
                </div>
                <div style="width: 40px; text-align: right; font-size: 12px; font-weight: bold;">${productionRate}%</div>
            </div>
        </div>`;
    });
    
    response += `</div>`;
    
    return response;
}

/**
 * Genel rapor oluştur
 * @param {Array} orders - Sipariş verileri
 * @param {Array} materials - Malzeme verileri
 * @param {Array} production - Üretim verileri
 * @param {string} timeframe - Zaman çerçevesi
 * @returns {string} Oluşturulan yanıt
 */
function generateGeneralReport(orders, materials, production, timeframe) {
    // Zaman çerçevesine göre filtreleme
    const filteredOrders = filterOrdersByTimeframe(orders, timeframe);
    
    // Sipariş durumu dağılımı
    const statusCounts = {
        planning: 0,
        waiting: 0,
        production: 0,
        ready: 0,
        testing: 0,
        completed: 0
    };
    
    filteredOrders.forEach(order => {
        if (statusCounts.hasOwnProperty(order.status)) {
            statusCounts[order.status]++;
        }
    });
    
    // Malzeme durumu
    const totalMaterials = materials.length;
    const inStockMaterials = materials.filter(m => m.inStock).length;
    const missingMaterials = materials.filter(m => !m.inStock).length;
    
    // Üretim durumu
    const activeProduction = production.filter(p => p.status === 'active').length;
    const delayedProduction = production.filter(p => p.isDelayed).length;
    
    // Geciken siparişler
    const delayedOrders = filteredOrders.filter(o => isOrderDelayed(o));
    
    // Rapor başlığı
    const timeframeText = getTimeframeText(timeframe);
    let response = `<strong>${timeframeText} Genel Rapor</strong><br><br>`;
    
    // Özet bilgiler
    response += `<div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between;">
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Toplam Sipariş</div>
                <div style="font-size: 24px; font-weight: bold; color: #0f172a;">${filteredOrders.length}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Aktif Sipariş</div>
                <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${filteredOrders.length - statusCounts.completed}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Eksik Malzeme</div>
                <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${missingMaterials}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Geciken</div>
                <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${delayedOrders.length}</div>
            </div>
        </div>
    </div>`;
    
    // Durum dağılımı görseli
    response += `<div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px;">
        <div style="flex: 2; min-width: 300px;">
            <strong>Sipariş Durumu Dağılımı:</strong><br><br>
            <div style="display: flex; height: 24px; border-radius: 4px; overflow: hidden; margin-bottom: 10px;">`;
    
    // Durum renkleri
    const statusColors = {
        planning: '#6b7280',
        waiting: '#f59e0b',
        production: '#3b82f6',
        ready: '#10b981',
        testing: '#8b5cf6',
        completed: '#1f2937'
    };
    
    // Durum açıklamaları
    const statusDesc = {
        planning: 'Planlama',
        waiting: 'Malzeme Bekleniyor',
        production: 'Üretimde',
        ready: 'Hazır',
        testing: 'Test',
        completed: 'Tamamlandı'
    };
    
    // Toplam sipariş sayısı
    const totalOrders = filteredOrders.length;
    
    // Durum çubuğunu oluştur
    Object.entries(statusCounts).forEach(([status, count]) => {
        if (count > 0) {
            const percent = Math.round((count / totalOrders) * 100);
            
            response += `<div style="width: ${percent}%; background-color: ${statusColors[status]}; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">
                ${percent}%
            </div>`;
        }
    });
    
    response += `</div>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">`;
    
    // Durum lejantları
    Object.entries(statusCounts).forEach(([status, count]) => {
        if (count > 0) {
            response += `<div style="display: flex; align-items: center; gap: 5px; margin-right: 15px;">
                <div style="width: 12px; height: 12px; background-color: ${statusColors[status]}; border-radius: 2px;"></div>
                <span style="font-size: 14px;">${statusDesc[status]} (${count})</span>
            </div>`;
        }
    });
    
    response += `</div>
        </div>
        
        <div style="flex: 1; min-width: 200px;">
            <strong>Malzeme Durumu:</strong><br><br>
            <div style="display: flex; height: 24px; border-radius: 4px; overflow: hidden; margin-bottom: 10px;">
                <div style="width: ${Math.round((inStockMaterials / totalMaterials) * 100)}%; background-color: #10b981; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">
                    ${Math.round((inStockMaterials / totalMaterials) * 100)}%
                </div>
                <div style="width: ${Math.round((missingMaterials / totalMaterials) * 100)}%; background-color: #ef4444; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">
                    ${Math.round((missingMaterials / totalMaterials) * 100)}%
                </div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 5px; margin-right: 15px;">
                    <div style="width: 12px; height: 12px; background-color: #10b981; border-radius: 2px;"></div>
                    <span style="font-size: 14px;">Stokta (${inStockMaterials})</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 12px; height: 12px; background-color: #ef4444; border-radius: 2px;"></div>
                    <span style="font-size: 14px;">Eksik (${missingMaterials})</span>
                </div>
            </div>
        </div>
    </div>`;
    
    // Geciken siparişler tablosu
    if (delayedOrders.length > 0) {
        response += `<br><strong>Geciken Siparişler (${delayedOrders.length}):</strong><br><br>`;
        
        response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Sipariş No</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Müşteri</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Teslim Tarihi</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Gecikme</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Durum</th>
            </tr>`;
        
        // Gecikme süresine göre sırala
        const sortedDelayedOrders = [...delayedOrders].sort((a, b) => {
            const aDate = new Date(a.deliveryDate?.toDate ? a.deliveryDate.toDate() : a.deliveryDate);
            const bDate = new Date(b.deliveryDate?.toDate ? b.deliveryDate.toDate() : b.deliveryDate);
            
            return aDate - bDate; // Erken teslim tarihi önce
        });
        
        // Sadece ilk 5 geciken siparişi göster
        const topDelayedOrders = sortedDelayedOrders.slice(0, 5);
        
        topDelayedOrders.forEach(order => {
            // Gecikme süresini hesapla
            const deliveryDate = new Date(order.deliveryDate?.toDate ? order.deliveryDate.toDate() : order.deliveryDate);
            const today = new Date();
            const delayDays = Math.floor((today - deliveryDate) / (1000 * 60 * 60 * 24));
            
            response += `<tr style="background-color: #fff5f5;">
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.orderNo}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.customer}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(order.deliveryDate)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #ef4444;"><strong>${delayDays} gün</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${statusDesc[order.status] || 'Bilinmiyor'}</td>
            </tr>`;
        });
        
        response += `</table></div>`;
        
        // Daha fazla geciken sipariş varsa belirt
        if (delayedOrders.length > topDelayedOrders.length) {
            response += `<br><em>...ve ${delayedOrders.length - topDelayedOrders.length} geciken sipariş daha</em>`;
        }
    }
    
    // Yaklaşan teslimler tablosu
    const upcomingDeliveries = filteredOrders.filter(o => {
        if (o.status !== 'completed' && o.deliveryDate) {
            const deliveryDate = new Date(o.deliveryDate?.toDate ? o.deliveryDate.toDate() : o.deliveryDate);
            const today = new Date();
            const daysToDelivery = Math.floor((deliveryDate - today) / (1000 * 60 * 60 * 24));
            
            return daysToDelivery >= 0 && daysToDelivery <= 14; // Önümüzdeki 2 hafta içinde
        }
        return false;
    });
    
    if (upcomingDeliveries.length > 0) {
        response += `<br><br><strong>Yaklaşan Teslimler (${upcomingDeliveries.length}):</strong><br><br>`;
        
        response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Sipariş No</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Müşteri</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Teslim Tarihi</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Kalan Gün</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Durum</th>
            </tr>`;
        
        // Teslim tarihine göre sırala
        const sortedUpcomingDeliveries = [...upcomingDeliveries].sort((a, b) => {
            const aDate = new Date(a.deliveryDate?.toDate ? a.deliveryDate.toDate() : a.deliveryDate);
            const bDate = new Date(b.deliveryDate?.toDate ? b.deliveryDate.toDate() : b.deliveryDate);
            
            return aDate - bDate; // Erken teslim tarihi önce
        });
        
        // Sadece ilk 5 yaklaşan teslimi göster
        const topUpcomingDeliveries = sortedUpcomingDeliveries.slice(0, 5);
        
        topUpcomingDeliveries.forEach(order => {
            // Kalan gün hesapla
            const deliveryDate = new Date(order.deliveryDate?.toDate ? order.deliveryDate.toDate() : order.deliveryDate);
            const today = new Date();
            const daysToDelivery = Math.floor((deliveryDate - today) / (1000 * 60 * 60 * 24));
            
            // Kalan gün rengini belirle
            let daysColor = '#6b7280';
            
            if (daysToDelivery <= 3) {
                daysColor = '#ef4444';
            } else if (daysToDelivery <= 7) {
                daysColor = '#f59e0b';
            }
            
            response += `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.orderNo}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.customer}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(order.deliveryDate)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: ${daysColor};">${daysToDelivery} gün</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${statusDesc[order.status] || 'Bilinmiyor'}</td>
            </tr>`;
        });
        
        response += `</table></div>`;
        
        // Daha fazla yaklaşan teslimat varsa belirt
        if (upcomingDeliveries.length > topUpcomingDeliveries.length) {
            response += `<br><em>...ve ${upcomingDeliveries.length - topUpcomingDeliveries.length} yaklaşan teslimat daha</em>`;
        }
    }
    
    return response;
}

/**
 * Optimizasyon yanıtı oluştur
 * @param {string} query - Kullanıcı sorgusu
 * @param {Object} queryInfo - Sorgu analiz bilgisi
 * @returns {Promise<string>} Oluşturulan yanıt
 */
async function generateOptimizationResponse(query, queryInfo) {
    // Veri önbelleğinden verileri al
    const orders = aiAssistantState.dataCache.orders || [];
    const materials = aiAssistantState.dataCache.materials || [];
    const production = aiAssistantState.dataCache.production || [];
    
    // Üretim optimizasyonu sorgusu
    if (query.toLowerCase().includes('üretim') || query.toLowerCase().includes('imalat')) {
        return generateProductionOptimizationResponse(orders, production);
    }
    
    // Malzeme optimizasyonu sorgusu
    if (query.toLowerCase().includes('malzeme') || query.toLowerCase().includes('tedarik')) {
        return generateMaterialOptimizationResponse(orders, materials);
    }
    
    // Genel optimizasyon
    return generateGeneralOptimizationResponse(orders, materials, production);
}

/**
 * Üretim optimizasyonu yanıtı oluştur
 * @param {Array} orders - Sipariş verileri
 * @param {Array} production - Üretim verileri
 * @returns {string} Oluşturulan yanıt
 */
function generateProductionOptimizationResponse(orders, production) {
    // Aktif siparişleri filtrele
    const activeOrders = orders.filter(o => o    // Özet bilgiler
    response += `<div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between;">
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Toplam Malzeme</div>
                <div style="font-size: 24px; font-weight: bold; color: #0f172a;">${totalMaterials}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Stokta Mevcut</div>
                <div style="font-size: 24px; font-weight: bold; color: #10b981;">${inStockMaterials}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Eksik Malzeme</div>
                <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${missingMaterials}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Kritik Seviyede</div>
                <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${criticalMaterials.length}</div>
            </div>
        </div>
    </div>`;
    
    // Stok durumu dağılımı
    response += `<strong>Stok Durumu:</strong><br><br>`;
    
    const inStockPercent = Math.round((inStockMaterials / totalMaterials) * 100);
    const missingPercent = Math.round((missingMaterials / totalMaterials) * 100);
    
    response += `<div style="display: flex; height: 24px; border-radius: 4px; overflow: hidden; margin-bottom: 10px;">
        <div style="width: ${inStockPercent}%; background-color: #10b981; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">
            ${inStockPercent}%
        </div>
        <div style="width: ${missingPercent}%; background-color: #ef4444; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">
            ${missingPercent}%
        </div>
    </div>
    <div style="display: flex; margin-bottom: 20px;">
        <div style="flex: 1; display: flex; align-items: center; gap: 5px;">
            <div style="width: 12px; height: 12px; background-color: #10b981; border-radius: 2px;"></div>
            <span style="font-size: 14px;">Stokta (${inStockMaterials})</span>
        </div>
        <div style="flex: 1; display: flex; align-items: center; gap: 5px;">
            <div style="width: 12px; height: 12px; background-color: #ef4444; border-radius: 2px;"></div>
            <span style="font-size: 14px;">Eksik (${missingMaterials})</span>
        </div>
    </div>`;
    
    // Tedarikçi dağılımı
    if (Object.keys(supplierCounts).length > 0) {
        response += `<strong>Tedarikçi Dağılımı:</strong><br><br>`;
        
        response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Tedarikçi</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Malzeme Sayısı</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Yüzde</th>
            </tr>`;
        
        // Tedarikçileri malzeme sayısına göre sırala
        const sortedSuppliers = Object.entries(supplierCounts).sort((a, b) => b[1] - a[1]);
        
        sortedSuppliers.forEach(([supplier, count]) => {
            const percent = Math.round((count / totalMaterials) * 100);
            
            response += `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${supplier}</td>
                <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">${count}</td>
                <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center;">
                        <div style="flex: 1; height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden; margin-right: 8px;">
                            <div style="height: 100%; width: ${percent}%; background-color: #3b82f6;"></div>
                        </div>
                        <div style="width: 40px; text-align: right;">${percent}%</div>
                    </div>
                </td>
            </tr>`;
        });
        
        response += `</table></div>`;
    }
    
    // Kritik malzemeler listesi
    if (criticalMaterials.length > 0) {
        response += `<br><strong>Kritik Seviyedeki Malzemeler:</strong><br><br>`;
        
        response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Malzeme</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Mevcut Stok</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Minimum Stok</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Tedarikçi</th>
            </tr>`;
        
        // Stoğu en düşük olandan başla
        const sortedCriticalMaterials = [...criticalMaterials].sort((a, b) => {
            const aStock = a.stock || 0;
            const bStock = b.stock || 0;
            
            return aStock - bStock;
        });
        
        sortedCriticalMaterials.forEach(material => {
            const stockRatio = ((material.stock || 0) / (material.minStock || 1)) * 100;
            let stockColor = '#ef4444';
            
            if (stockRatio > 50) {
                stockColor = '#f59e0b';
            } else if (stockRatio <= 25) {
                stockColor = '#dc2626';
            }
            
            response += `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${material.name}</td>
                <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0; color: ${stockColor};"><strong>${material.stock || 0}</strong></td>
                <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">${material.minStock || "-"}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${material.supplier || "-"}</td>
            </tr>`;
        });
        
        response += `</table></div>`;
    }
    
    return response;
}

/**
 * Üretim raporu oluştur
 * @param {Array} production - Üretim verileri
 * @param {Array} orders - Sipariş verileri
 * @param {string} timeframe - Zaman çerçevesi
 * @returns {string} Oluşturulan yanıt
 */
function generateProductionReport(production, orders, timeframe) {
    // Zaman çerçevesine göre filtreleme
    const filteredProduction = filterProductionByTimeframe(production, timeframe);
    
    // Üretim durumu dağılımı
    const statusCounts = {
        planning: 0,
        waiting: 0,
        active: 0,
        completed: 0
    };
    
    filteredProduction.forEach(prod => {
        if (statusCounts.hasOwnProperty(prod.status)) {
            statusCounts[prod.status]++;
        }
    });
    
    // Gecikmiş üretimler
    const delayedProduction = filteredProduction.filter(p => p.isDelayed);
    
    // Ortalama üretim süresi (gün olarak)
    let avgProductionDays = 0;
    
    if (filteredProduction.length > 0) {
        let totalDays = 0;
        let countWithDates = 0;
        
        filteredProduction.forEach(prod => {
            if (prod.startDate && prod.endDate) {
                const startDate = new Date(prod.startDate?.toDate ? prod.startDate.toDate() : prod.startDate);
                const endDate = new Date(prod.endDate?.toDate ? prod.endDate.toDate() : prod.endDate);
                
                const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
                
                if (days > 0) {
                    totalDays += days;
                    countWithDates++;
                }
            }
        });
        
        if (countWithDates > 0) {
            avgProductionDays = Math.round(totalDays / countWithDates);
        }
    }
    
    // Rapor başlığı
    const timeframeText = getTimeframeText(timeframe);
    let response = `<strong>${timeframeText} Üretim Raporu</strong><br><br>`;
    
    // Özet bilgiler
    response += `<div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between;">
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Toplam Üretim</div>
                <div style="font-size: 24px; font-weight: bold; color: #0f172a;">${filteredProduction.length}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Aktif Üretim</div>
                <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${statusCounts.active}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Tamamlanan</div>
                <div style="font-size: 24px; font-weight: bold; color: #10b981;">${statusCounts.completed}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Geciken</div>
                <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${delayedProduction.length}</div>
            </div>
        </div>
    </div>`;
    
    // Üretim verimliliği
    response += `<strong>Üretim Verimliliği:</strong><br><br>`;
    
    // Zamanında tamamlanan yüzdesi
    const completedProduction = filteredProduction.filter(p => p.status === 'completed');
    let onTimePercentage = 0;
    
    if (completedProduction.length > 0) {
        const onTimeCompleted = completedProduction.filter(p => !p.isDelayed);
        onTimePercentage = Math.round((onTimeCompleted.length / completedProduction.length) * 100) || 0;
    }
    
    response += `<div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1; min-width: 200px; padding: 15px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${onTimePercentage}%</div>
            <div style="font-size: 14px; color: #64748b;">Zamanında Tamamlama Oranı</div>
        </div>
        <div style="flex: 1; min-width: 200px; padding: 15px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${avgProductionDays}</div>
            <div style="font-size: 14px; color: #64748b;">Ortalama Üretim Süresi (Gün)</div>
        </div>
    </div>`;
    
    // Aktif üretimler
    if (statusCounts.active > 0) {
        response += `<br><strong>Aktif Üretimler:</strong><br><br>`;
        
        response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Sipariş No</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Müşteri</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">İlerleme</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Kalan Gün</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Planlanan Bitiş</th>
            </tr>`;
        
        // Aktif üretimleri filtrele ve bitiş tarihine göre sırala
        const activeProduction = filteredProduction
            .filter(p => p.status === 'active')
            .sort((a, b) => {
                const aDate = new Date(a.endDate?.toDate ? a.endDate.toDate() : a.endDate);
                const bDate = new Date(b.endDate?.toDate ? b.endDate.toDate() : b.endDate);
                
                return aDate - bDate;
            });
        
        activeProduction.forEach(prod => {
            // İlgili siparişi bul
            const order = orders.find(o => o.orderNo === prod.orderNo);
            
            // İlerleme
            const progress = prod.progress || 0;
            
            // Kalan gün hesapla
            const today = new Date();
            const endDate = new Date(prod.endDate?.toDate ? prod.endDate.toDate() : prod.endDate);
            const remainingDays = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
            
            // İlerleme çubuk rengi
            const progressBarColor = progress < 30 ? '#ef4444' : progress < 70 ? '#f59e0b' : '#10b981';
            
            // Kalan gün rengi
            let remainingDaysColor = '#6b7280';
            
            if (remainingDays < 0) {
                remainingDaysColor = '#ef4444';
            } else if (remainingDays <= 3) {
                remainingDaysColor = '#f59e0b';
            }
            
            response += `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${prod.orderNo}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order?.customer || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center;">
                        <div style="flex: 1; height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden; margin-right: 8px;">
                            <div style="height: 100%; width: ${progress}%; background-color: ${progressBarColor};"></div>
                        </div>
                        <div style="width: 40px; text-align: right;">${progress}%</div>
                    </div>
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: ${remainingDaysColor};">
                    ${remainingDays < 0 ? `${Math.abs(remainingDays)} gün gecikme` : `${remainingDays} gün`}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(prod.endDate)}</td>
            </tr>`;
        });
        
        response += `</table></div>`;
    }
    
    // Gecikmiş üretimler
    if (delayedProduction.length > 0) {
        response += `<br><strong>Gecikmiş Üretimler:</strong><br><br>`;
        
        response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Sipariş No</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Müşteri</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Gecikme Süresi</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Gecikme Nedeni</th>
            </tr>`;
        
        // Gecikme süresine göre sırala
        const sortedDelayedProduction = [...delayedProduction].sort((a, b) => {
            const aDate = new Date(a.endDate?.toDate ? a.endDate.toDate() : a.endDate);
            const bDate = new Date(b.endDate?.toDate ? b.endDate.toDate() : b.endDate);
            
            return aDate - bDate;
        });
        
        sortedDelayedProduction.forEach(prod => {
            // İlgili siparişi bul
            const order = orders.find(o => o.orderNo === prod.orderNo);
            
            // Gecikme süresi hesapla
            const today = new Date();
            const endDate = new Date(prod.endDate?.toDate ? prod.endDate.toDate() : prod.endDate);
            const delayDays = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));
            
            response += `<tr style="background-color: #fff5f5;">
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${prod.orderNo}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order?.customer || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #ef4444;"><strong>${delayDays} gün</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${prod.delayReason || 'Belirtilmemiş'}</td>
            </tr>`;
        });
        
        response += `</table></div>`;
    }
    
    return response;
}

/**
 * Müşteri raporu oluştur
 * @param {Array} orders - Sipariş verileri
 * @param {string} timeframe - Zaman çerçevesi
 * @returns {string} Oluşturulan yanıt
 */
function generateCustomerReport(orders, timeframe) {
    // Zaman çerçevesine göre filtreleme
    const filteredOrders = filterOrdersByTimeframe(orders, timeframe);
    
    // Müşteri bazlı sipariş sayıları
    const customerCounts = {};
    const customerOrderStatus = {};
    const customerDelayedOrders = {};
    
    filteredOrders.forEach(order => {
        if (order.customer) {
            // Sipariş sayısı
            customerCounts[order.customer] = (customerCounts[order.customer] || 0) + 1;
            
            // Sipariş durumu
            if (!customerOrderStatus[order.customer]) {
                customerOrderStatus[order.customer] = {
                    planning: 0,
                    waiting: 0,
                    production: 0,
                    ready: 0,
                    testing: 0,
                    completed: 0
                };
            }
            
            if (customerOrderStatus[order.customer].hasOwnProperty(order.status)) {
                customerOrderStatus[order.customer][order.status]++;
            }
            
            // Geciken siparişler
            if (isOrderDelayed(order)) {
                customerDelayedOrders[order.customer] = (customerDelayedOrders[order.customer] || 0) + 1;
            }
        }
    });
    
    // Rapor başlığı
    const timeframeText = getTimeframeText(timeframe);
    let response = `<strong>${timeframeText} Müşteri Raporu</strong><br><br>`;
    
    // Özet bilgiler
    response += `<div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between;">
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Toplam Müşteri</div>
                <div style="font-size: 24px; font-weight: bold; color: #0f172a;">${Object.keys(customerCounts).length}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Toplam Sipariş</div>
                <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${filteredOrders.length}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Tamamlanan</div>
                <div style="font-size: 24px; font-weight: bold; color: #10b981;">
                    ${filteredOrders.filter(o => o.status === 'completed').length}
                </div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Geciken</div>
                <div style="font-size: 24px; font-weight: bold; color: #ef4444;">
                    ${filteredOrders.filter(o => isOrderDelayed(o)).length}
                </div>
            </div>
        </div>
    </div>`;
    
    // Müşteri sipariş tablosu
    response += `<strong>Müşteri Sipariş Dağılımı:</strong><br><br>`;
    
    response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f8fafc;">
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Müşteri</th>
            <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Toplam Sipariş</th>
            <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Aktif</th>
            <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Tamamlanan</th>
            <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Geciken</th>
        </tr>`;
    
    // Sipariş sayısına göre müşterileri sırala
    const sortedCustomers = Object.entries(customerCounts).sort((a, b) => b[1] - a[1]);
    
    sortedCustomers.forEach(([customer, count]) => {
        const active = count - (customerOrderStatus[customer]?.completed || 0);
        const completed = customerOrderStatus[customer]?.completed || 0;
        const delayed = customerDelayedOrders[customer] || 0;
        
        response += `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${customer}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">${count}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #3b82f6;">${active}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #10b981;">${completed}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0; ${delayed > 0 ? 'color: #ef4444;' : ''}">
                ${delayed}
            </td>
        </tr>`;
    });
    
    response += `</table></div>`;
    
    // Müşteri memnuniyet göstergesi
    response += `<br><strong>Müşteri Zamanında Teslimat Oranı:</strong><br><br>`;
    
    response += `<div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">`;
    
    sortedCustomers
        .filter(([customer, count]) => count >= 2) // En az 2 siparişi olan müşteriler
        .slice(0, 5) // En fazla 5 müşteri
        .forEach(([customer, count]) => {
            const completed = customerOrderStatus[customer]?.completed || 0;
            const delayed = customerDelayedOrders[customer] || 0;
            
            let onTimePercentage = 0;
            
            if (completed > 0) {
                onTimePercentage = Math.round(((completed - delayed) / completed) * 100);
            }
            
            // Renk belirle
            let barColor = '#ef4444';
            
            if (onTimePercentage >= 90) {
                barColor = '#10b981';
            } else if (onTimePercentage >= 75) {
                barColor = '#3b82f6';
            } else if (onTimePercentage >= 50) {
                barColor = '#f59e0b';
            }
            
            response += `<div style="flex: 1; min-width: 200px; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">${customer}</div>
                <div style="height: 8px; background-color: #f1f5f9; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                    <div style="height: 100%; width: ${onTimePercentage}%; background-color: ${barColor};"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px;">
                    <span>${onTimePercentage}% zamanında</span>
                    <span>${completed} tamamlanan</span>
                </div>
            </div>`;
        });
    
    response += `</div>`;
    
    return response;
}

/**
 * Performans raporu oluştur
 * @param {Array} orders - Sipariş verileri
 * @param {Array} production - Üretim verileri    // Başlık
    let titleTimeframe = '';
    
    switch(queryInfo.timeframe) {
        case 'day':
            titleTimeframe = 'Bugünkü';
            break;
        case 'week':
            titleTimeframe = 'Bu Haftaki';
            break;
        case 'month':
            titleTimeframe = 'Bu Ayki';
            break;
        default:
            titleTimeframe = 'Güncel';
    }
    
    // Yanıt başlığı
    let response = `<strong>${titleTimeframe} Üretim Planı (${filteredProduction.length} adet):</strong><br><br>`;
    
    // Gantt benzeri zaman çizelgesi
    response += `<div style="overflow-x: auto; margin-bottom: 20px;">
        <div style="min-width: 600px;">
            <div style="display: flex; margin-bottom: 10px;">
                <div style="width: 200px; font-weight: bold; padding-left: 5px;">Sipariş</div>
                <div style="flex: 1; display: flex; justify-content: space-between; padding: 0 5px;">`;
    
    // Zaman çizelgesi üst çizgi (tarihler)
    const now = new Date();
    let startDate, endDate;
    
    // Zaman çerçevesine göre aralık belirle
    if (queryInfo.timeframe === 'day') {
        startDate = new Date(now);
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 1);
    } else if (queryInfo.timeframe === 'week') {
        startDate = new Date(now);
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 7);
    } else if (queryInfo.timeframe === 'month') {
        startDate = new Date(now);
        endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
    } else {
        // Varsayılan olarak 2 ay göster
        startDate = new Date(now);
        endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 2);
    }
    
    // Zaman çubuğu aralıkları
    let intervalCount = 6; // Varsayılan olarak 6 aralık
    const interval = Math.floor((endDate - startDate) / intervalCount);
    
    for (let i = 0; i <= intervalCount; i++) {
        const date = new Date(startDate.getTime() + (interval * i));
        response += `<span>${formatShortDate(date)}</span>`;
    }
    
    response += `</div></div>`;
    
    // En fazla 10 üretim göster
    const displayProduction = filteredProduction.slice(0, 10);
    
    // Siparişleri ve zaman çubuklarını ekle
    displayProduction.forEach(prod => {
        // İlgili siparişi bul
        const order = orders.find(o => o.orderNo === prod.orderNo);
        
        // Başlangıç ve bitiş tarihleri
        const pStartDate = new Date(prod.startDate?.toDate ? prod.startDate.toDate() : prod.startDate);
        const pEndDate = new Date(prod.endDate?.toDate ? prod.endDate.toDate() : prod.endDate);
        
        // İlerleme yüzdesi
        const progress = prod.progress || 0;
        
        // Çubuk rengi
        let barColor = '#3b82f6'; // Varsayılan mavi
        
        if (prod.status === 'completed') {
            barColor = '#10b981'; // Yeşil (tamamlandı)
        } else if (prod.isDelayed) {
            barColor = '#ef4444'; // Kırmızı (gecikme)
        } else if (prod.status === 'waiting') {
            barColor = '#f59e0b'; // Turuncu (beklemede)
        }
        
        // Çubuğun başlangıç pozisyonu (yüzde olarak)
        const startPercent = Math.max(0, Math.min(100, (pStartDate - startDate) / (endDate - startDate) * 100));
        
        // Çubuğun genişliği (yüzde olarak)
        const durationPercent = Math.max(0, Math.min(100 - startPercent, (pEndDate - pStartDate) / (endDate - startDate) * 100));
        
        response += `<div style="display: flex; margin-bottom: 8px; align-items: center;">
            <div style="width: 200px; padding-right: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${prod.orderNo} - ${order?.customer || ''}">
                ${prod.orderNo} ${order ? `- ${order.customer}` : ''}
            </div>
            <div style="flex: 1; height: 30px; position: relative; background-color: #f1f5f9; border-radius: 4px;">
                <div style="position: absolute; top: 0; left: ${startPercent}%; width: ${durationPercent}%; height: 100%; background-color: ${barColor}; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">
                    ${Math.round(progress)}%
                </div>
            </div>
        </div>`;
    });
    
    response += `</div></div>`;
    
    // Daha fazla üretim olduğunu belirt
    if (filteredProduction.length > displayProduction.length) {
        response += `<br><em>...ve ${filteredProduction.length - displayProduction.length} üretim daha</em>`;
    }
    
    // Günlük özet
    response += `<br><strong>Üretim Özeti:</strong><br>`;
    
    // Durum dağılımı
    const activeCount = filteredProduction.filter(p => p.status === 'active').length;
    const waitingCount = filteredProduction.filter(p => p.status === 'waiting').length;
    const completedCount = filteredProduction.filter(p => p.status === 'completed').length;
    const delayedCount = filteredProduction.filter(p => p.isDelayed).length;
    
    response += `- Aktif üretim: ${activeCount}<br>`;
    response += `- Malzeme bekleyen: ${waitingCount}<br>`;
    
    if (delayedCount > 0) {
        response += `- Gecikmiş üretim: <span style="color: #ef4444;">${delayedCount}</span><br>`;
    }
    
    if (completedCount > 0) {
        response += `- Tamamlanan: ${completedCount}<br>`;
    }
    
    return response;
}

/**
 * Aktif üretim yanıtı oluştur
 * @param {Array} activeProduction - Aktif üretim listesi
 * @param {Array} orders - Sipariş verileri
 * @returns {string} Oluşturulan yanıt
 */
function generateActiveProductionResponse(activeProduction, orders) {
    // Yanıt başlığı
    let response = `<strong>Aktif Üretimler (${activeProduction.length} adet):</strong><br><br>`;
    
    // İlerlemeye göre sırala
    const sortedProduction = [...activeProduction].sort((a, b) => {
        const aProgress = a.progress || 0;
        const bProgress = b.progress || 0;
        
        return bProgress - aProgress; // Yüksek ilerleme önce
    });
    
    // Tablo oluştur
    response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f8fafc;">
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Sipariş No</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Müşteri</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">İlerleme</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Başlangıç</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Bitiş</th>
        </tr>`;
    
    sortedProduction.forEach(prod => {
        // İlgili siparişi bul
        const order = orders.find(o => o.orderNo === prod.orderNo);
        
        // İlerleme yüzdesi
        const progress = prod.progress || 0;
        
        // İlerleme çubuğu rengi
        const progressBarColor = progress < 30 ? '#ef4444' : progress < 70 ? '#f59e0b' : '#10b981';
        
        // Gecikme stilini belirle
        const rowStyle = prod.isDelayed ? 'background-color: #fff5f5;' : '';
        
        response += `<tr style="${rowStyle}">
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${prod.orderNo}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order?.customer || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center;">
                    <div style="flex: 1; height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden; margin-right: 8px;">
                        <div style="height: 100%; width: ${progress}%; background-color: ${progressBarColor};"></div>
                    </div>
                    <div style="width: 40px; text-align: right;">${progress}%</div>
                </div>
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(prod.startDate)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                ${formatDate(prod.endDate)}
                ${prod.isDelayed ? '<span style="color: #ef4444; font-size: 12px; margin-left: 5px;">⚠️ Gecikme</span>' : ''}
            </td>
        </tr>`;
    });
    
    response += `</table></div>`;
    
    // Gecikme özeti
    const delayedProduction = activeProduction.filter(p => p.isDelayed);
    
    if (delayedProduction.length > 0) {
        response += `<br><div style="background-color: #fff5f5; padding: 12px; border-radius: 4px; border-left: 4px solid #ef4444;">
            <strong style="color: #ef4444;">⚠️ Gecikme Uyarısı:</strong> ${delayedProduction.length} adet üretimde gecikme yaşanmaktadır. Bu durum ilgili siparişlerin teslim tarihlerinde gecikmeye neden olabilir.
        </div>`;
    }
    
    return response;
}

/**
 * Rapor yanıtı oluştur
 * @param {string} query - Kullanıcı sorgusu
 * @param {Object} queryInfo - Sorgu analiz bilgisi
 * @returns {Promise<string>} Oluşturulan yanıt
 */
async function generateReportResponse(query, queryInfo) {
    // Veri önbelleğinden verileri al
    const orders = aiAssistantState.dataCache.orders || [];
    const materials = aiAssistantState.dataCache.materials || [];
    const production = aiAssistantState.dataCache.production || [];
    
    // Zaman çerçevesi belirle
    const timeframe = queryInfo.timeframe || 'month'; // Varsayılan aylık
    
    // Rapor türünü belirle
    const reportType = determineReportType(query);
    
    switch (reportType) {
        case 'sipariş':
        case 'proje':
            return generateOrderReport(orders, timeframe);
        case 'malzeme':
        case 'tedarik':
            return generateMaterialReport(materials, timeframe);
        case 'üretim':
            return generateProductionReport(production, orders, timeframe);
        case 'müşteri':
            return generateCustomerReport(orders, timeframe);
        case 'performans':
            return generatePerformanceReport(orders, production, timeframe);
        default:
            // Genel rapor
            return generateGeneralReport(orders, materials, production, timeframe);
    }
}

/**
 * Rapor türünü belirle
 * @param {string} query - Kullanıcı sorgusu
 * @returns {string} Rapor türü
 */
function determineReportType(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('sipariş') || lowerQuery.includes('proje')) {
        return 'sipariş';
    } else if (lowerQuery.includes('malzeme') || lowerQuery.includes('tedarik') || lowerQuery.includes('stok')) {
        return 'malzeme';
    } else if (lowerQuery.includes('üretim') || lowerQuery.includes('imalat')) {
        return 'üretim';
    } else if (lowerQuery.includes('müşteri')) {
        return 'müşteri';
    } else if (lowerQuery.includes('performans') || lowerQuery.includes('verimlilik')) {
        return 'performans';
    } else {
        return 'genel';
    }
}

/**
 * Sipariş raporu oluştur
 * @param {Array} orders - Sipariş verileri
 * @param {string} timeframe - Zaman çerçevesi
 * @returns {string} Oluşturulan yanıt
 */
function generateOrderReport(orders, timeframe) {
    // Zaman çerçevesine göre filtreleme
    const filteredOrders = filterOrdersByTimeframe(orders, timeframe);
    
    // Durum dağılımı
    const statusCounts = {
        planning: 0,
        waiting: 0,
        production: 0,
        ready: 0,
        testing: 0,
        completed: 0
    };
    
    filteredOrders.forEach(order => {
        if (statusCounts.hasOwnProperty(order.status)) {
            statusCounts[order.status]++;
        }
    });
    
    // Müşteri dağılımı
    const customerCounts = {};
    
    filteredOrders.forEach(order => {
        if (order.customer) {
            customerCounts[order.customer] = (customerCounts[order.customer] || 0) + 1;
        }
    });
    
    // Hücre tipi dağılımı
    const cellTypeCounts = {};
    
    filteredOrders.forEach(order => {
        if (order.cellType) {
            cellTypeCounts[order.cellType] = (cellTypeCounts[order.cellType] || 0) + 1;
        }
    });
    
    // Gecikme durumu
    const delayedOrders = filteredOrders.filter(o => isOrderDelayed(o));
    
    // Rapor başlığı
    const timeframeText = getTimeframeText(timeframe);
    let response = `<strong>${timeframeText} Sipariş Raporu</strong><br><br>`;
    
    // Özet bilgiler
    response += `<div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between;">
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Toplam Sipariş</div>
                <div style="font-size: 24px; font-weight: bold; color: #0f172a;">${filteredOrders.length}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Aktif Sipariş</div>
                <div style="font-size: 24px; font-weight: bold; color: #0f172a;">${filteredOrders.length - statusCounts.completed}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Tamamlanan</div>
                <div style="font-size: 24px; font-weight: bold; color: #10b981;">${statusCounts.completed}</div>
            </div>
            <div style="flex: 1; min-width: 120px;">
                <div style="font-size: 14px; color: #64748b;">Geciken</div>
                <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${delayedOrders.length}</div>
            </div>
        </div>
    </div>`;
    
    // Durum dağılımı
    response += `<strong>Durum Dağılımı:</strong><br><br>`;
    
    response += `<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">`;
    
    // Durum renkleri
    const statusColors = {
        planning: '#6b7280',
        waiting: '#f59e0b',
        production: '#3b82f6',
        ready: '#10b981',
        testing: '#8b5cf6',
        completed: '#1f2937'
    };
    
    // Durum açıklamaları
    const statusDesc = {
        planning: 'Planlama',
        waiting: 'Malzeme Bekleniyor',
        production: 'Üretimde',
        ready: 'Hazır',
        testing: 'Test',
        completed: 'Tamamlandı'
    };
    
    Object.entries(statusCounts).forEach(([status, count]) => {
        if (count > 0) {
            const percent = Math.round((count / filteredOrders.length) * 100);
            
            response += `<div style="flex: 1; min-width: 120px; text-align: center; padding: 12px; background-color: ${statusColors[status]}20; border-radius: 8px; border-left: 4px solid ${statusColors[status]};">
                <div style="font-size: 20px; font-weight: bold; color: ${statusColors[status]};">${count}</div>
                <div style="font-size: 14px; color: #64748b;">${statusDesc[status]}</div>
                <div style="font-size: 12px; color: #94a3b8;">${percent}%</div>
            </div>`;
        }
    });
    
    response += `</div>`;
    
    // Müşteri dağılımı
    if (Object.keys(customerCounts).length > 0) {
        response += `<strong>Müşteri Dağılımı:</strong><br><br>`;
        
        response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Müşteri</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Sipariş Sayısı</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Yüzde</th>
            </tr>`;
        
        // Müşterileri sipariş sayısına göre sırala
        const sortedCustomers = Object.entries(customerCounts).sort((a, b) => b[1] - a[1]);
        
        sortedCustomers.forEach(([customer, count]) => {
            const percent = Math.round((count / filteredOrders.length) * 100);
            
            response += `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${customer}</td>
                <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">${count}</td>
                <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center;">
                        <div style="flex: 1; height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden; margin-right: 8px;">
                            <div style="height: 100%; width: ${percent}%; background-color: #3b82f6;"></div>
                        </div>
                        <div style="width: 40px; text-align: right;">${percent}%</div>
                    </div>
                </td>
            </tr>`;
        });
        
        response += `</table></div>`;
    }
    
    // Gecikme durumu
    if (delayedOrders.length > 0) {
        response += `<br><strong>Gecikmiş Siparişler:</strong><br><br>`;
        
        response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Sipariş No</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Müşteri</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Teslim Tarihi</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Gecikme</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Durum</th>
            </tr>`;
        
        // Gecikme süresine göre sırala
        const sortedDelayedOrders = [...delayedOrders].sort((a, b) => {
            const aDate = new Date(a.deliveryDate?.toDate ? a.deliveryDate.toDate() : a.deliveryDate);
            const bDate = new Date(b.deliveryDate?.toDate ? b.deliveryDate.toDate() : b.deliveryDate);
            
            return aDate - bDate; // Erken teslim tarihi önce
        });
        
        sortedDelayedOrders.forEach(order => {
            // Gecikme süresini hesapla
            const deliveryDate = new Date(order.deliveryDate?.toDate ? order.deliveryDate.toDate() : order.deliveryDate);
            const today = new Date();
            const delayDays = Math.floor((today - deliveryDate) / (1000 * 60 * 60 * 24));
            
            response += `<tr style="background-color: #fff5f5;">
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.orderNo}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.customer}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(order.deliveryDate)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #ef4444;"><strong>${delayDays} gün</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${statusDesc[order.status] || 'Bilinmiyor'}</td>
            </tr>`;
        });
        
        response += `</table></div>`;
    }
    
    return response;
}

/**
 * Malzeme raporu oluştur
 * @param {Array} materials - Malzeme verileri
 * @param {string} timeframe - Zaman çerçevesi
 * @returns {string} Oluşturulan yanıt
 */
function generateMaterialReport(materials, timeframe) {
    // Temel malzeme istatistikleri
    const totalMaterials = materials.length;
    const inStockMaterials = materials.filter(m => m.inStock).length;
    const missingMaterials = materials.filter(m => !m.inStock).length;
    
    // Kritik stok seviyesinin altında olanlar
    const criticalMaterials = materials.filter(m => m.stock < m.minStock);
    
    // Tedarikçi dağılımı
    const supplierCounts = {};
    
    materials.forEach(material => {
        if (material.supplier) {
            supplierCounts[material.supplier] = (supplierCounts[material.supplier] || 0) + 1;
        }
    });
    
    // Rapor başlığı
    const timeframeText = getTimeframeText(timeframe);
    let response = `<strong>${timeframeText} Malzeme Raporu</strong><br><br>`;
    
    // Özet bilgiler
    response += `<div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display/**
 * advanced-ai.js
 * Gelişmiş Yapay Zeka ve NLP destekli asistan işlevleri
 */

// AI Asistanı için global durum değişkenleri
const aiAssistantState = {
    isProcessing: false,
    lastQuery: null,
    context: {},
    conversation: [],
    dataCache: {
        orders: null,
        materials: null,
        production: null,
        customers: null
    },
    lastUpdate: null
};

/**
 * Chatbot'u başlat ve gerekli verileri yükle
 */
function initAIAssistant() {
    console.log("Yapay Zeka Asistanı başlatılıyor...");
    
    // Chatbot arayüzünü iyileştir
    enhanceChatbotUI();
    
    // İlk veri önbelleğini oluştur
    refreshAssistantDataCache();
    
    // Chatbot penceresini göster/gizle olayını bağla
    const chatbotTrigger = document.querySelector('.chatbot-trigger');
    if (chatbotTrigger) {
        chatbotTrigger.addEventListener('click', toggleAIAssistant);
    }
    
    // Chatbot mesaj gönderme olayını bağla
    const chatbotSend = document.querySelector('.chatbot-send');
    if (chatbotSend) {
        chatbotSend.addEventListener('click', sendAIQuery);
    }
    
    // Enter tuşu ile mesaj gönderme
    const chatbotInput = document.getElementById('chatbot-input');
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAIQuery();
            }
        });
    }
    
    // Chatbot penceresini kapatma olayını bağla
    const chatbotClose = document.querySelector('.chatbot-close');
    if (chatbotClose) {
        chatbotClose.addEventListener('click', toggleAIAssistant);
    }
    
    // Karşılama mesajını göster
    setTimeout(() => {
        displayWelcomeMessage();
    }, 500);
    
    // Veri değişikliklerini dinle
    listenToDataChanges();
    
    console.log("Yapay Zeka Asistanı başlatıldı");
}

/**
 * Chatbot arayüzünü iyileştir ve bilgi göstergesi ekle
 */
function enhanceChatbotUI() {
    // Chatbot penceresine bilgi göstergesi ekle
    const chatbotWindow = document.getElementById('chatbot-window');
    if (!chatbotWindow) return;
    
    // AI Yeteneği göstergesi
    const aiCapabilityBadge = document.createElement('div');
    aiCapabilityBadge.className = 'ai-capability-badge';
    aiCapabilityBadge.style.position = 'absolute';
    aiCapabilityBadge.style.top = '10px';
    aiCapabilityBadge.style.right = '40px';
    aiCapabilityBadge.style.backgroundColor = '#1e40af';
    aiCapabilityBadge.style.color = 'white';
    aiCapabilityBadge.style.fontSize = '10px';
    aiCapabilityBadge.style.padding = '2px 6px';
    aiCapabilityBadge.style.borderRadius = '10px';
    aiCapabilityBadge.textContent = 'Yapay Zeka';
    
    const chatbotHeader = chatbotWindow.querySelector('.chatbot-header');
    if (chatbotHeader) {
        chatbotHeader.style.position = 'relative';
        chatbotHeader.appendChild(aiCapabilityBadge);
        
        // Asistan başlığını güncelle
        const chatbotTitle = chatbotHeader.querySelector('.chatbot-title span');
        if (chatbotTitle) {
            chatbotTitle.textContent = 'Akıllı Asistan';
        }
    }
    
    // Öneri kümeleri ekleyin
    const chatbotBody = document.getElementById('chatbot-body');
    if (chatbotBody) {
        chatbotBody.style.paddingBottom = '65px'; // Öneriler için yer açın
    }
    
    // Öneriler bölümü
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'ai-suggestions';
    suggestionsContainer.style.position = 'absolute';
    suggestionsContainer.style.bottom = '65px';
    suggestionsContainer.style.left = '0';
    suggestionsContainer.style.right = '0';
    suggestionsContainer.style.padding = '10px 15px';
    suggestionsContainer.style.backgroundColor = '#f8fafc';
    suggestionsContainer.style.borderTop = '1px solid #e2e8f0';
    suggestionsContainer.style.display = 'flex';
    suggestionsContainer.style.flexWrap = 'wrap';
    suggestionsContainer.style.gap = '8px';
    suggestionsContainer.style.overflowX = 'auto';
    suggestionsContainer.style.whiteSpace = 'nowrap';
    suggestionsContainer.style.maxHeight = '60px';
    
    // Örnek öneriler
    const suggestions = [
        'Aktif siparişler',
        'Malzeme durumu',
        'Geciken işler',
        'Üretim planı',
        'Aylık rapor'
    ];
    
    suggestions.forEach(suggestion => {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.textContent = suggestion;
        chip.style.backgroundColor = '#e2e8f0';
        chip.style.color = '#1e40af';
        chip.style.border = 'none';
        chip.style.borderRadius = '16px';
        chip.style.padding = '6px 12px';
        chip.style.fontSize = '12px';
        chip.style.cursor = 'pointer';
        chip.style.whiteSpace = 'nowrap';
        
        chip.addEventListener('click', () => {
            document.getElementById('chatbot-input').value = suggestion;
            sendAIQuery();
        });
        
        suggestionsContainer.appendChild(chip);
    });
    
    chatbotWindow.appendChild(suggestionsContainer);
    
    // Giriş metni alanını genişletin ve içeriğine göre büyüyüp küçülmesini sağlayın
    const chatbotInput = document.getElementById('chatbot-input');
    if (chatbotInput) {
        chatbotInput.style.minHeight = '24px';
        chatbotInput.style.maxHeight = '80px';
        chatbotInput.style.resize = 'none';
        chatbotInput.placeholder = 'Sipariş durumu, üretim planı, malzeme vb. sorgulayın...';
        
        // Metin alanını bir textarea'ya dönüştürün
        const textarea = document.createElement('textarea');
        textarea.id = 'chatbot-input';
        textarea.className = 'chatbot-input';
        textarea.placeholder = 'Sipariş durumu, üretim planı, malzeme vb. sorgulayın...';
        textarea.style.flex = '1';
        textarea.style.minHeight = '24px';
        textarea.style.maxHeight = '80px';
        textarea.style.resize = 'none';
        textarea.style.padding = '0.75rem 1rem';
        textarea.style.border = '1px solid var(--border)';
        textarea.style.borderRadius = '0.375rem';
        textarea.style.fontSize = '0.875rem';
        textarea.style.overflow = 'auto';
        
        // Otomatik boyutlandırma için olay dinleyicisi
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(80, this.scrollHeight) + 'px';
        });
        
        // Enter ile gönderme (Shift+Enter ile yeni satır)
        textarea.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAIQuery();
            }
        });
        
        // Eski input alanını değiştirin
        chatbotInput.parentNode.replaceChild(textarea, chatbotInput);
    }
}

/**
 * Hoş geldin mesajını göster
 */
function displayWelcomeMessage() {
    const chatBody = document.getElementById('chatbot-body');
    if (!chatBody) return;
    
    // Eski mesajları temizle
    chatBody.innerHTML = '';
    
    // Karşılama mesajı
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'chat-message bot';
    welcomeMessage.innerHTML = `
        <p>Merhaba! Ben ElektroTrack'in yapay zeka destekli asistanıyım. Size şu konularda yardımcı olabilirim:</p>
        <ul style="margin-top: 8px; margin-left: 20px; list-style-type: disc;">
            <li>Sipariş durumları ve detayları</li>
            <li>Malzeme tedarik takibi</li>
            <li>Üretim planlaması ve gecikme riskleri</li>
            <li>Raporlama ve analizler</li>
            <li>Optimizasyon önerileri</li>
        </ul>
        <p style="margin-top: 8px;">Sorularınızı doğal dilde sorabilirsiniz. Örneğin: <em>"24-03-B002 siparişinin durumu nedir?"</em> veya <em>"Bu ay teslim edilecek siparişler hangileri?"</em></p>
    `;
    
    chatBody.appendChild(welcomeMessage);
    
    // Örnek önerileri güncelle
    updateSuggestions([
        'Aktif siparişler neler?',
        'Malzeme eksikleri',
        'Geciken işler hangileri?',
        'Bu ay teslim edilecekler',
        'Üretim optimizasyonu'
    ]);
}

/**
 * Öneri çiplerini güncelle
 * @param {Array} suggestions - Öneri metinleri dizisi
 */
function updateSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('ai-suggestions');
    if (!suggestionsContainer) return;
    
    // Mevcut önerileri temizle
    suggestionsContainer.innerHTML = '';
    
    // Yeni önerileri ekle
    suggestions.forEach(suggestion => {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.textContent = suggestion;
        chip.style.backgroundColor = '#e2e8f0';
        chip.style.color = '#1e40af';
        chip.style.border = 'none';
        chip.style.borderRadius = '16px';
        chip.style.padding = '6px 12px';
        chip.style.fontSize = '12px';
        chip.style.cursor = 'pointer';
        chip.style.whiteSpace = 'nowrap';
        
        chip.addEventListener('click', () => {
            document.getElementById('chatbot-input').value = suggestion;
            sendAIQuery();
        });
        
        suggestionsContainer.appendChild(chip);
    });
}

/**
 * Veri değişikliklerini dinle
 */
function listenToDataChanges() {
    // Sayfa değişikliği olayını dinle
    document.addEventListener('pageChanged', function(event) {
        // Veri önbelleğini yenile
        refreshAssistantDataCache();
    });
    
    // Dashboard verilerini güncelleme olayını dinle
    document.addEventListener('dashboardDataUpdated', function(event) {
        refreshAssistantDataCache();
    });
    
    // Sipariş verisi değişikliği olayını dinle
    document.addEventListener('orderDataChanged', function(event) {
        // Sipariş verilerini yenile
        loadOrdersData().then(orders => {
            aiAssistantState.dataCache.orders = orders;
        });
    });
    
    // Malzeme verisi değişikliği olayını dinle
    document.addEventListener('materialsDataChanged', function(event) {
        // Malzeme verilerini yenile
        loadMaterialsData().then(materials => {
            aiAssistantState.dataCache.materials = materials;
        });
    });
}

/**
 * AI Asistanı için tüm veri önbelleğini yenile
 */
async function refreshAssistantDataCache() {
    console.log("AI Asistanı veri önbelleği yenileniyor...");
    
    try {
        // Paralel veri yükleme
        const [orders, materials, production, customers] = await Promise.all([
            loadOrdersData(),
            loadMaterialsData(),
            loadProductionData(),
            loadCustomersData()
        ]);
        
        // Verileri önbelleğe kaydet
        aiAssistantState.dataCache = {
            orders,
            materials,
            production,
            customers
        };
        
        // Son güncelleme zamanını kaydet
        aiAssistantState.lastUpdate = new Date();
        
        console.log("AI Asistanı veri önbelleği güncellendi:", 
            orders?.length || 0, "sipariş,", 
            materials?.length || 0, "malzeme");
            
        // Veri güncellendiğini bildir
        document.dispatchEvent(new CustomEvent('aiDataCacheUpdated'));
        
        return aiAssistantState.dataCache;
    } catch (error) {
        console.error("AI Asistanı veri önbelleği yenilenemedi:", error);
        return null;
    }
}

/**
 * Sipariş verilerini yükle
 * @returns {Promise<Array>} Sipariş verileri
 */
async function loadOrdersData() {
    try {
        // Firebase Firestore varsa
        if (firebase && firebase.firestore) {
            const ordersRef = firebase.firestore().collection('orders');
            const snapshot = await ordersRef.get();
            
            if (snapshot.empty) {
                return getDemoOrders();
            }
            
            const orders = [];
            snapshot.forEach(doc => {
                orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return orders;
        } else {
            // Firebase yoksa demo verilerini kullan
            return getDemoOrders();
        }
    } catch (error) {
        console.error("Sipariş verileri yüklenemedi:", error);
        return getDemoOrders();
    }
}

/**
 * Malzeme verilerini yükle
 * @returns {Promise<Array>} Malzeme verileri
 */
async function loadMaterialsData() {
    try {
        // Firebase Firestore varsa
        if (firebase && firebase.firestore) {
            const materialsRef = firebase.firestore().collection('materials');
            const snapshot = await materialsRef.get();
            
            if (snapshot.empty) {
                return getDemoMaterials();
            }
            
            const materials = [];
            snapshot.forEach(doc => {
                materials.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return materials;
        } else {
            // Firebase yoksa demo verilerini kullan
            return getDemoMaterials();
        }
    } catch (error) {
        console.error("Malzeme verileri yüklenemedi:", error);
        return getDemoMaterials();
    }
}

/**
 * Üretim verilerini yükle
 * @returns {Promise<Object>} Üretim verileri
 */
async function loadProductionData() {
    try {
        // Firebase Firestore varsa
        if (firebase && firebase.firestore) {
            const productionRef = firebase.firestore().collection('production');
            const snapshot = await productionRef.get();
            
            if (snapshot.empty) {
                return getDemoProduction();
            }
            
            const production = [];
            snapshot.forEach(doc => {
                production.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return production;
        } else {
            // Firebase yoksa demo verilerini kullan
            return getDemoProduction();
        }
    } catch (error) {
        console.error("Üretim verileri yüklenemedi:", error);
        return getDemoProduction();
    }
}

/**
 * Müşteri verilerini yükle
 * @returns {Promise<Array>} Müşteri verileri
 */
async function loadCustomersData() {
    try {
        // Firebase Firestore varsa
        if (firebase && firebase.firestore) {
            const customersRef = firebase.firestore().collection('customers');
            const snapshot = await customersRef.get();
            
            if (snapshot.empty) {
                return getDemoCustomers();
            }
            
            const customers = [];
            snapshot.forEach(doc => {
                customers.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return customers;
        } else {
            // Firebase yoksa demo verilerini kullan
            return getDemoCustomers();
        }
    } catch (error) {
        console.error("Müşteri verileri yüklenemedi:", error);
        return getDemoCustomers();
    }
}

/**
 * AI Asistanı penceresini göster/gizle
 */
function toggleAIAssistant() {
    const chatbotWindow = document.getElementById('chatbot-window');
    if (chatbotWindow) {
        // Şu anki durumunu tersine çevir
        const isVisible = chatbotWindow.style.display === 'flex';
        
        if (isVisible) {
            // Chatbot penceresini gizle
            chatbotWindow.style.display = 'none';
        } else {
            // Chatbot penceresini göster
            chatbotWindow.style.display = 'flex';
            
            // Veri önbelleğini yenile (gerekliyse)
            if (!aiAssistantState.lastUpdate || 
                (new Date() - aiAssistantState.lastUpdate) > 5 * 60 * 1000) { // 5 dakikadan eski ise
                refreshAssistantDataCache();
            }
            
            // Input alanına odaklan
            document.getElementById('chatbot-input')?.focus();
        }
    }
}

/**
 * AI asistanına sorgu gönder
 */
async function sendAIQuery() {
    const chatInput = document.getElementById('chatbot-input');
    if (!chatInput) return;
    
    const query = chatInput.value.trim();
    if (!query) return;
    
    // İşlem durumunu güncelle
    aiAssistantState.isProcessing = true;
    aiAssistantState.lastQuery = query;
    
    // Kullanıcı mesajını ekle
    const chatBody = document.getElementById('chatbot-body');
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'chat-message user';
    userMessageElement.textContent = query;
    chatBody.appendChild(userMessageElement);
    
    // Input alanını temizle
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Scroll down
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Yükleniyor mesajı göster
    const loadingElement = document.createElement('div');
    loadingElement.className = 'chat-message bot';
    loadingElement.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatBody.appendChild(loadingElement);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    try {
        // Sorgu işleme
        const response = await processAIQuery(query);
        
        // Yükleniyor mesajını kaldır
        chatBody.removeChild(loadingElement);
        
        // Yanıtı ekle
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'chat-message bot';
        
        // HTML içeriği varsa doğrudan yerleştir, yoksa metin olarak ekle
        if (response.includes('<') && response.includes('>')) {
            botMessageElement.innerHTML = response;
        } else {
            botMessageElement.textContent = response;
        }
        
        chatBody.appendChild(botMessageElement);
        
        // Konuşmaya ekle
        aiAssistantState.conversation.push({
            role: 'user',
            content: query
        }, {
            role: 'assistant',
            content: response
        });
        
        // Önerileri güncelle
        updateSuggestionsBasedOnQuery(query);
    } catch (error) {
        console.error("AI sorgu işleme hatası:", error);
        
        // Yükleniyor mesajını kaldır
        chatBody.removeChild(loadingElement);
        
        // Hata mesajı ekle
        const errorElement = document.createElement('div');
        errorElement.className = 'chat-message bot';
        errorElement.textContent = 'Üzgünüm, sorunuzu işlerken bir hata oluştu. Lütfen tekrar deneyin.';
        chatBody.appendChild(errorElement);
    } finally {
        // İşlem durumunu güncelle
        aiAssistantState.isProcessing = false;
        
        // Scroll down
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

/**
 * AI sorgusunu işle ve yanıt oluştur
 * @param {string} query - Kullanıcı sorgusu
 * @returns {Promise<string>} AI yanıtı
 */
async function processAIQuery(query) {
    console.log("İşleniyor:", query);
    
    // Veri önbelleği dolu mu kontrol et
    if (!aiAssistantState.dataCache.orders || 
        !aiAssistantState.dataCache.materials) {
        await refreshAssistantDataCache();
    }
    
    // Sorgu anahtar kelimeleri ve konusu analizi
    const queryInfo = analyzeQuery(query);
    console.log("Sorgu analizi:", queryInfo);
    
    // Yanıt oluştur
    let response = '';
    
    switch (queryInfo.topic) {
        case 'order':
            response = await generateOrderResponse(query, queryInfo);
            break;
        case 'material':
            response = await generateMaterialResponse(query, queryInfo);
            break;
        case 'production':
            response = await generateProductionResponse(query, queryInfo);
            break;
        case 'report':
            response = await generateReportResponse(query, queryInfo);
            break;
        case 'optimization':
            response = await generateOptimizationResponse(query, queryInfo);
            break;
        case 'general':
        default:
            response = await generateGeneralResponse(query, queryInfo);
    }
    
    // Demo sistemlerde işleme gecikmesi simülasyonu (500-1500ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    return response;
}

/**
 * Malzeme ile ilgili yanıt oluştur
 * @param {string} query - Kullanıcı sorgusu
 * @param {Object} queryInfo - Sorgu analiz bilgisi
 * @returns {Promise<string>} Oluşturulan yanıt
 */
async function generateMaterialResponse(query, queryInfo) {
    // Veri önbelleğinden malzemeleri al
    const materials = aiAssistantState.dataCache.materials || [];
    
    // Eksik malzemeler sorgusu
    if (query.toLowerCase().includes('eksik') || query.toLowerCase().includes('stokta olmayan')) {
        const missingMaterials = materials.filter(m => !m.inStock);
        
        if (missingMaterials.length === 0) {
            return "Şu anda eksik malzeme bulunmamaktadır. Tüm malzemeler stokta mevcut.";
        }
        
        return generateMissingMaterialsResponse(missingMaterials);
    }
    
    // Sipariş numarası bazlı sorgu
    if (queryInfo.orderNumber) {
        const orderMaterials = materials.filter(m => m.orderNo === queryInfo.orderNumber);
        
        if (orderMaterials.length === 0) {
            return `"${queryInfo.orderNumber}" numaralı sipariş için malzeme bilgisi bulunamadı.`;
        }
        
        return generateOrderMaterialsResponse(orderMaterials, queryInfo.orderNumber);
    }
    
    // Genel malzeme durumu
    const totalMaterials = materials.length;
    const inStockMaterials = materials.filter(m => m.inStock).length;
    const missingMaterials = materials.filter(m => !m.inStock).length;
    
    // Kritik stok seviyesinin altında olanlar
    const criticalMaterials = materials.filter(m => m.stock < m.minStock);
    
    // Yanıt oluştur
    let response = `<strong>Malzeme Durumu Özeti:</strong><br><br>`;
    
    response += `- Toplam malzeme: ${totalMaterials}<br>`;
    response += `- Stokta mevcut: ${inStockMaterials}<br>`;
    
    if (missingMaterials > 0) {
        response += `- Eksik malzeme: <span style="color: #ef4444;">${missingMaterials}</span><br>`;
    }
    
    if (criticalMaterials.length > 0) {
        response += `- Kritik seviyede: <span style="color: #f59e0b;">${criticalMaterials.length}</span><br>`;
    }
    
    // Eksik malzemeler tablosu (en kritik 5 malzeme)
    if (missingMaterials > 0) {
        // Öncelik sırasına göre sırala
        const sortedMissingMaterials = [...materials]
            .filter(m => !m.inStock)
            .sort((a, b) => {
                // İlk önce kritiklik durumuna göre
                if (a.orderNeedDate && b.orderNeedDate) {
                    const aDate = new Date(a.orderNeedDate?.toDate ? a.orderNeedDate.toDate() : a.orderNeedDate);
                    const bDate = new Date(b.orderNeedDate?.toDate ? b.orderNeedDate.toDate() : b.orderNeedDate);
                    
                    return aDate - bDate;
                }
                
                if (a.orderNeedDate) return -1;
                if (b.orderNeedDate) return 1;
                
                return 0;
            });
        
        // En kritik 5 malzemeyi göster
        const topCriticalMaterials = sortedMissingMaterials.slice(0, 5);
        
        response += `<br><strong>Eksik Malzemeler:</strong><br><br>`;
        
        response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Malzeme</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Sipariş No</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Tedarik Tarihi</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Öncelik</th>
            </tr>`;
        
        topCriticalMaterials.forEach(material => {
            // Öncelik belirleme
            let priority = 'Normal';
            let priorityColor = '#6b7280';
            
            if (material.expectedSupplyDate && material.orderNeedDate) {
                const supplyDate = new Date(material.expectedSupplyDate?.toDate ? material.expectedSupplyDate.toDate() : material.expectedSupplyDate);
                const needDate = new Date(material.orderNeedDate?.toDate ? material.orderNeedDate.toDate() : material.orderNeedDate);
                
                if (supplyDate > needDate) {
                    priority = 'Kritik';
                    priorityColor = '#ef4444';
                } else {
                    const today = new Date();
                    const daysToNeed = Math.floor((needDate - today) / (1000 * 60 * 60 * 24));
                    
                    if (daysToNeed <= 7) {
                        priority = 'Yüksek';
                        priorityColor = '#f59e0b';
                    }
                }
            }
            
            response += `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${material.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${material.orderNo || "-"}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(material.expectedSupplyDate) || "Belirsiz"}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: ${priorityColor};">${priority}</td>
            </tr>`;
        });
        
        response += `</table></div>`;
        
        // Daha fazla malzeme varsa belirt
        if (missingMaterials > topCriticalMaterials.length) {
            response += `<br><em>...ve ${missingMaterials - topCriticalMaterials.length} eksik malzeme daha</em>`;
        }
        
        // Detaylı bilgi için öneri
        response += `<br><br>Daha detaylı bilgi için "eksik malzemeler" yazabilirsiniz.`;
    }
    
    return response;
}

/**
 * Eksik malzemeler yanıtı oluştur
 * @param {Array} materials - Eksik malzeme listesi
 * @returns {string} Oluşturulan yanıt
 */
function generateMissingMaterialsResponse(materials) {
    // Önceliğe göre sırala
    const sortedMaterials = [...materials].sort((a, b) => {
        // İlk önce kritiklik durumuna göre
        if (a.orderNeedDate && b.orderNeedDate) {
            const aDate = new Date(a.orderNeedDate?.toDate ? a.orderNeedDate.toDate() : a.orderNeedDate);
            const bDate = new Date(b.orderNeedDate?.toDate ? b.orderNeedDate.toDate() : b.orderNeedDate);
            
            return aDate - bDate;
        }
        
        if (a.orderNeedDate) return -1;
        if (b.orderNeedDate) return 1;
        
        return 0;
    });
    
    // Yanıt başlığı
    let response = `<strong>Eksik Malzemeler (${materials.length} adet):</strong><br><br>`;
    
    // Tablo oluştur
    response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f8fafc;">
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Malzeme</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Kod</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Sipariş No</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Tedarikçi</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Tedarik Tarihi</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Öncelik</th>
        </tr>`;
    
    sortedMaterials.forEach(material => {
        // Öncelik belirleme
        let priority = 'Normal';
        let priorityColor = '#6b7280';
        let rowStyle = '';
        
        if (material.expectedSupplyDate && material.orderNeedDate) {
            const supplyDate = new Date(material.expectedSupplyDate?.toDate ? material.expectedSupplyDate.toDate() : material.expectedSupplyDate);
            const needDate = new Date(material.orderNeedDate?.toDate ? material.orderNeedDate.toDate() : material.orderNeedDate);
            
            if (supplyDate > needDate) {
                priority = 'Kritik';
                priorityColor = '#ef4444';
                rowStyle = 'background-color: #fff5f5;';
            } else {
                const today = new Date();
                const daysToNeed = Math.floor((needDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysToNeed <= 7) {
                    priority = 'Yüksek';
                    priorityColor = '#f59e0b';
                    rowStyle = 'background-color: #fffbeb;';
                }
            }
        }
        
        response += `<tr style="${rowStyle}">
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${material.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${material.code || "-"}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${material.orderNo || "-"}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${material.supplier || "-"}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(material.expectedSupplyDate) || "Belirsiz"}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: ${priorityColor};">${priority}</td>
        </tr>`;
    });
    
    response += `</table></div>`;
    
    // Öncelik dağılımı özeti
    const criticalCount = sortedMaterials.filter(m => {
        if (m.expectedSupplyDate && m.orderNeedDate) {
            const supplyDate = new Date(m.expectedSupplyDate?.toDate ? m.expectedSupplyDate.toDate() : m.expectedSupplyDate);
            const needDate = new Date(m.orderNeedDate?.toDate ? m.orderNeedDate.toDate() : m.orderNeedDate);
            
            return supplyDate > needDate;
        }
        return false;
    }).length;
    
    const highCount = sortedMaterials.filter(m => {
        if (m.expectedSupplyDate && m.orderNeedDate) {
            const supplyDate = new Date(m.expectedSupplyDate?.toDate ? m.expectedSupplyDate.toDate() : m.expectedSupplyDate);
            const needDate = new Date(m.orderNeedDate?.toDate ? m.orderNeedDate.toDate() : m.orderNeedDate);
            
            if (supplyDate > needDate) return false;
            
            const today = new Date();
            const daysToNeed = Math.floor((needDate - today) / (1000 * 60 * 60 * 24));
            
            return daysToNeed <= 7;
        }
        return false;
    }).length;
    
    response += `<br><strong>Öncelik Dağılımı:</strong><br>`;
    
    if (criticalCount > 0) {
        response += `- Kritik: <span style="color: #ef4444;">${criticalCount}</span><br>`;
    }
    
    if (highCount > 0) {
        response += `- Yüksek: <span style="color: #f59e0b;">${highCount}</span><br>`;
    }
    
    response += `- Normal: <span style="color: #6b7280;">${materials.length - criticalCount - highCount}</span><br>`;
    
    return response;
}

/**
 * Sipariş malzemeleri yanıtı oluştur
 * @param {Array} materials - Siparişe ait malzeme listesi
 * @param {string} orderNo - Sipariş numarası
 * @returns {string} Oluşturulan yanıt
 */
function generateOrderMaterialsResponse(materials, orderNo) {
    // Yanıt başlığı
    let response = `<strong>${orderNo} Sipariş Malzemeleri:</strong><br><br>`;
    
    // Malzeme durumu özeti
    const totalMaterials = materials.length;
    const inStockMaterials = materials.filter(m => m.inStock).length;
    const missingMaterials = materials.filter(m => !m.inStock).length;
    
    // Tamamlanma yüzdesi
    const completionPercentage = Math.round((inStockMaterials / totalMaterials) * 100) || 0;
    
    // İlerleme çubuğu
    const progressBarColor = completionPercentage < 60 ? '#ef4444' : completionPercentage < 90 ? '#f59e0b' : '#10b981';
    
    response += `<div style="margin-bottom: 15px;">
        <div style="margin-bottom: 5px; display: flex; justify-content: space-between;">
            <span>Malzeme Durumu: ${inStockMaterials}/${totalMaterials}</span>
            <span>${completionPercentage}%</span>
        </div>
        <div style="height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: ${completionPercentage}%; background-color: ${progressBarColor};"></div>
        </div>
    </div>`;
    
    // Malzeme listesi tablosu
    response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f8fafc;">
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Malzeme</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Kod</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Durum</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Tedarik Tarihi</th>
        </tr>`;
    
    materials.forEach(material => {
        const statusText = material.inStock ? 'Stokta' : 'Tedarik Edilecek';
        const statusColor = material.inStock ? '#10b981' : '#f59e0b';
        const rowStyle = material.inStock ? '' : (
            material.expectedSupplyDate && material.orderNeedDate && 
            new Date(material.expectedSupplyDate?.toDate ? material.expectedSupplyDate.toDate() : material.expectedSupplyDate) > 
            new Date(material.orderNeedDate?.toDate ? material.orderNeedDate.toDate() : material.orderNeedDate)
        ) ? 'background-color: #fff5f5;' : '';
        
        response += `<tr style="${rowStyle}">
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${material.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${material.code || "-"}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: ${statusColor};">${statusText}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${material.inStock ? '-' : (formatDate(material.expectedSupplyDate) || "Belirsiz")}</td>
        </tr>`;
    });
    
    response += `</table></div>`;
    
    // Kritik malzemeler uyarısı
    if (missingMaterials > 0) {
        const criticalMaterials = materials.filter(m => {
            if (!m.inStock && m.expectedSupplyDate && m.orderNeedDate) {
                const supplyDate = new Date(m.expectedSupplyDate?.toDate ? m.expectedSupplyDate.toDate() : m.expectedSupplyDate);
                const needDate = new Date(m.orderNeedDate?.toDate ? m.orderNeedDate.toDate() : m.orderNeedDate);
                
                return supplyDate > needDate;
            }
            return false;
        });
        
        if (criticalMaterials.length > 0) {
            response += `<br><div style="background-color: #fff5f5; padding: 12px; border-radius: 4px; border-left: 4px solid #ef4444;">
                <strong style="color: #ef4444;">⚠️ Kritik Uyarı:</strong> ${criticalMaterials.length} adet malzemenin tedarik tarihi, ihtiyaç tarihinden sonra. Bu durum siparişin teslim tarihinde gecikmeye yol açabilir.
            </div>`;
        }
    }
    
    return response;
}

/**
 * Üretim ile ilgili yanıt oluştur
 * @param {string} query - Kullanıcı sorgusu
 * @param {Object} queryInfo - Sorgu analiz bilgisi
 * @returns {Promise<string>} Oluşturulan yanıt
 */
async function generateProductionResponse(query, queryInfo) {
    // Veri önbelleğinden üretim verilerini al
    const production = aiAssistantState.dataCache.production || [];
    const orders = aiAssistantState.dataCache.orders || [];
    
    // Sipariş numarası bazlı sorgu
    if (queryInfo.orderNumber) {
        const orderProduction = production.find(p => p.orderNo === queryInfo.orderNumber);
        const order = orders.find(o => o.orderNo === queryInfo.orderNumber);
        
        if (!orderProduction) {
            if (order && order.status === 'planning') {
                return `"${queryInfo.orderNumber}" numaralı sipariş henüz planlama aşamasında. Üretim planı oluşturulmamış.`;
            }
            
            return `"${queryInfo.orderNumber}" numaralı sipariş için üretim bilgisi bulunamadı.`;
        }
        
        return generateOrderProductionResponse(orderProduction, order);
    }
    
    // Üretim planı genel sorgu
    if (query.toLowerCase().includes('plan') || query.toLowerCase().includes('çizelge')) {
        return generateProductionPlanResponse(production, orders, queryInfo);
    }
    
    // Aktif üretimler sorgusu
    const activeProduction = production.filter(p => p.status === 'active');
    
    if (activeProduction.length === 0) {
        return "Şu anda aktif üretimde sipariş bulunmamaktadır.";
    }
    
    return generateActiveProductionResponse(activeProduction, orders);
}

/**
 * Sipariş üretim yanıtı oluştur
 * @param {Object} production - Siparişe ait üretim verisi
 * @param {Object} order - Sipariş verisi
 * @returns {string} Oluşturulan yanıt
 */
function generateOrderProductionResponse(production, order) {
    // Siparişin durumunu kontrol et
    const statusDesc = {
        'planning': 'Planlama aşamasında',
        'waiting': 'Malzeme tedariki bekleniyor',
        'production': 'Üretim aşamasında',
        'ready': 'Üretime hazır',
        'testing': 'Test aşamasında',
        'completed': 'Tamamlanmış'
    };
    
    // Yanıt oluştur
    let response = `<strong>${production.orderNo}</strong> numaralı sipariş `;
    
    if (order) {
        response += `<strong>${statusDesc[order.status] || "Bilinmeyen durumda"}</strong>.`;
    } else {
        response += `<strong>${production.status === 'active' ? 'Üretim aşamasında' : 'Planlama aşamasında'}</strong>.`;
    }
    
    // Üretim tarihleri
    response += `<br><br><strong>Üretim Bilgileri:</strong><br>`;
    response += `- Planlanan başlangıç: ${formatDate(production.startDate)}<br>`;
    response += `- Planlanan bitiş: ${formatDate(production.endDate)}<br>`;
    
    // İlerleme bilgisi
    const progress = production.progress || 0;
    
    // İlerleme çubuğu
    const progressBarColor = progress < 30 ? '#ef4444' : progress < 70 ? '#f59e0b' : '#10b981';
    
    response += `<br><div style="margin-bottom: 15px;">
        <div style="margin-bottom: 5px; display: flex; justify-content: space-between;">
            <span>İlerleme Durumu</span>
            <span>${progress}%</span>
        </div>
        <div style="height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: ${progress}%; background-color: ${progressBarColor};"></div>
        </div>
    </div>`;
    
    // Üretim aşamaları
    if (production.stages && production.stages.length > 0) {
        response += `<br><strong>Üretim Aşamaları:</strong><br><br>`;
        
        response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Aşama</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Durum</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Başlangıç</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Bitiş</th>
            </tr>`;
        
        production.stages.forEach(stage => {
            let statusText = 'Bekliyor';
            let statusColor = '#6b7280';
            
            if (stage.status === 'completed') {
                statusText = 'Tamamlandı';
                statusColor = '#10b981';
            } else if (stage.status === 'active') {
                statusText = 'Devam Ediyor';
                statusColor = '#3b82f6';
            } else if (stage.status === 'delayed') {
                statusText = 'Gecikme';
                statusColor = '#ef4444';
            }
            
            response += `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${stage.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: ${statusColor};">${statusText}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(stage.startDate) || "-"}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(stage.endDate) || "-"}</td>
            </tr>`;
        });
        
        response += `</table></div>`;
    }
    
    // Gecikme bildirimi
    if (production.isDelayed) {
        response += `<br><div style="background-color: #fff5f5; padding: 12px; border-radius: 4px; border-left: 4px solid #ef4444;">
            <strong style="color: #ef4444;">⚠️ Gecikme Bildirimi:</strong> Bu siparişin üretiminde gecikme yaşanmaktadır. ${production.delayReason || ""}
        </div>`;
    }
    
    // Malzeme bilgisi
    if (order && order.status === 'waiting') {
        response += `<br><div style="background-color: #fffbeb; padding: 12px; border-radius: 4px; border-left: 4px solid #f59e0b;">
            <strong style="color: #f59e0b;">⚠️ Malzeme Bekleniyor:</strong> Bu sipariş için bazı malzemeler tedarik sürecindedir. Üretim, tüm malzemeler temin edildikten sonra başlayacaktır.
        </div>`;
    }
    
    return response;
}

/**
 * Üretim planı yanıtı oluştur
 * @param {Array} production - Üretim verileri
 * @param {Array} orders - Sipariş verileri
 * @param {Object} queryInfo - Sorgu analiz bilgisi
 * @returns {string} Oluşturulan yanıt
 */
function generateProductionPlanResponse(production, orders, queryInfo) {
    // Tarihe göre sırala
    const sortedProduction = [...production].sort((a, b) => {
        const aDate = new Date(a.startDate?.toDate ? a.startDate.toDate() : a.startDate);
        const bDate = new Date(b.startDate?.toDate ? b.startDate.toDate() : b.startDate);
        
        return aDate - bDate;
    });
    
    // Zaman filtresi
    let filteredProduction = sortedProduction;
    
    if (queryInfo.timeframe) {
        const now = new Date();
        
        switch(queryInfo.timeframe) {
            case 'day':
                filteredProduction = sortedProduction.filter(p => {
                    const startDate = new Date(p.startDate?.toDate ? p.startDate.toDate() : p.startDate);
                    const endDate = new Date(p.endDate?.toDate ? p.endDate.toDate() : p.endDate);
                    
                    return startDate.toDateString() === now.toDateString() || 
                           endDate.toDateString() === now.toDateString() ||
                           (startDate <= now && endDate >= now);
                });
                break;
            case 'week':
                const oneWeekLater = new Date(now);
                oneWeekLater.setDate(now.getDate() + 7);
                
                filteredProduction = sortedProduction.filter(p => {
                    const startDate = new Date(p.startDate?.toDate ? p.startDate.toDate() : p.startDate);
                    const endDate = new Date(p.endDate?.toDate ? p.endDate.toDate() : p.endDate);
                    
                    return (startDate >= now && startDate <= oneWeekLater) || 
                           (endDate >= now && endDate <= oneWeekLater) ||
                           (startDate <= now && endDate >= oneWeekLater);
                });
                break;
            case 'month':
                const oneMonthLater = new Date(now);
                oneMonthLater.setMonth(now.getMonth() + 1);
                
                filteredProduction = sortedProduction.filter(p => {
                    const startDate = new Date(p.startDate?.toDate ? p.startDate.toDate() : p.startDate);
                    const endDate = new Date(p.endDate?.toDate ? p.endDate.toDate() : p.endDate);
                    
                    return (startDate >= now && startDate <= oneMonthLater) || 
                           (endDate >= now && endDate <= oneMonthLater) ||
                           (startDate <= now && endDate >= oneMonthLater);
                });
                break;
        }
    }

/**
 * Kullanıcı sorgusunu analiz et
 * @param {string} query - Kullanıcı sorgusu
 * @returns {Object} Sorgu analiz sonucu
 */
function analyzeQuery(query) {
    // Sorguyu küçük harfe çevir
    const lowerQuery = query.toLowerCase();
    
    // Anahtar kelimeler için Türkçe kelime grupları
    const keywords = {
        order: ['sipariş', 'siparişler', 'siparis', 'iş', 'müşteri', 'sipariş no', 'sipariş numarası'],
        material: ['malzeme', 'stok', 'tedarik', 'malzemeler', 'eksik', 'temin'],
        production: ['üretim', 'planlama', 'plan', 'üretim planı', 'imalat', 'montaj', 'test'],
        status: ['durum', 'durumu', 'ne durumda', 'aşama', 'safha', 'hangi aşamada'],
        delay: ['gecikme', 'geç', 'bekleyen', 'geciken', 'ertelenen', 'gecikmeli'],
        report: ['rapor', 'analiz', 'raporla', 'aylık', 'haftalık', 'günlük', 'istatistik'],
        optimization: ['optimizasyon', 'öneri', 'tavsiye', 'iyileştirme', 'iyileştir']
    };
    
    // Sipariş numarası formatı (24-03-A001 gibi)
    const orderNumberPattern = /\d{2}-\d{2}-[A-Za-z]\d{3}/;
    const orderNumberMatch = query.match(orderNumberPattern);
    const orderNumber = orderNumberMatch ? orderNumberMatch[0] : null;
    
    // Müşteri ismi kontrolü
    const customerNames = ['AYEDAŞ', 'ENERJİSA', 'BAŞKENT EDAŞ', 'TOROSLAR EDAŞ'];
    const customerMatch = customerNames.find(name => lowerQuery.includes(name.toLowerCase()));
    const customer = customerMatch || null;
    
    // Gecikme sorgusunda mı?
    const isDelayQuery = keywords.delay.some(keyword => lowerQuery.includes(keyword));
    
    // Durum sorgusunda mı?
    const isStatusQuery = keywords.status.some(keyword => lowerQuery.includes(keyword));
    
    // Tarih bilgisi var mı?
    const datePatterns = [
        /bugün/i, /yarın/i, /dün/i,
        /bu (hafta|ay|yıl)/i, /geçen (hafta|ay|yıl)/i, /gelecek (hafta|ay|yıl)/i,
        /(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/  // DD/MM/YYYY veya benzer formatlar
    ];
    const dateMatch = datePatterns.some(pattern => pattern.test(lowerQuery));
    
    // Ana konu belirleme
    let topic = 'general';
    
    if (keywords.order.some(keyword => lowerQuery.includes(keyword)) || orderNumber) {
        topic = 'order';
    } else if (keywords.material.some(keyword => lowerQuery.includes(keyword))) {
        topic = 'material';
    } else if (keywords.production.some(keyword => lowerQuery.includes(keyword))) {
        topic = 'production';
    } else if (keywords.report.some(keyword => lowerQuery.includes(keyword))) {
        topic = 'report';
    } else if (keywords.optimization.some(keyword => lowerQuery.includes(keyword))) {
        topic = 'optimization';
    }
    
    // Zaman çerçevesi belirleme
    let timeframe = null;
    
    if (lowerQuery.includes('bu ay') || lowerQuery.includes('aylık')) {
        timeframe = 'month';
    } else if (lowerQuery.includes('bu hafta') || lowerQuery.includes('haftalık')) {
        timeframe = 'week';
    } else if (lowerQuery.includes('bu yıl') || lowerQuery.includes('yıllık')) {
        timeframe = 'year';
    } else if (lowerQuery.includes('bugün') || lowerQuery.includes('günlük')) {
        timeframe = 'day';
    } else if (lowerQuery.includes('3 aylık') || lowerQuery.includes('çeyrek')) {
        timeframe = 'quarter';
    } else if (lowerQuery.includes('6 aylık') || lowerQuery.includes('yarıyıl')) {
        timeframe = 'half-year';
    }
    
    // Rapor analizi
    const isReportRequest = keywords.report.some(keyword => lowerQuery.includes(keyword));
    
    return {
        topic,
        orderNumber,
        customer,
        isDelayQuery,
        isStatusQuery,
        isReportRequest,
        hasDateInfo: dateMatch,
        timeframe,
        originalQuery: query
    };
}

/**
 * Sipariş ile ilgili yanıt oluştur
 * @param {string} query - Kullanıcı sorgusu
 * @param {Object} queryInfo - Sorgu analiz bilgisi
 * @returns {Promise<string>} Oluşturulan yanıt
 */
async function generateOrderResponse(query, queryInfo) {
    // Veri önbelleğinden siparişleri al
    const orders = aiAssistantState.dataCache.orders || [];
    
    // Belirli bir sipariş numarası sorgulanıyorsa
    if (queryInfo.orderNumber) {
        const order = orders.find(o => o.orderNo === queryInfo.orderNumber);
        
        if (!order) {
            return `"${queryInfo.orderNumber}" numaralı sipariş bulunamadı. Lütfen sipariş numarasını kontrol ediniz.`;
        }
        
        // Durum sorgusu ise durum bilgisine odaklan
        if (queryInfo.isStatusQuery) {
            return generateOrderStatusResponse(order);
        }
        
        // Genel sipariş detayları
        return generateOrderDetailsResponse(order);
    }
    
    // Müşteri bazlı sorgu
    if (queryInfo.customer) {
        const customerOrders = orders.filter(o => o.customer?.toLowerCase() === queryInfo.customer.toLowerCase());
        
        if (customerOrders.length === 0) {
            return `${queryInfo.customer} müşterisine ait sipariş bulunamadı.`;
        }
        
        // Gecikme sorgusu
        if (queryInfo.isDelayQuery) {
            const delayedOrders = customerOrders.filter(o => isOrderDelayed(o));
            
            if (delayedOrders.length === 0) {
                return `${queryInfo.customer} müşterisine ait geciken sipariş bulunmamaktadır.`;
            }
            
            return generateDelayedOrdersResponse(delayedOrders, queryInfo.customer);
        }
        
        // Müşterinin siparişlerini listele
        return generateCustomerOrdersResponse(customerOrders);
    }
    
    // Gecikmeli siparişler sorgusu
    if (queryInfo.isDelayQuery) {
        const delayedOrders = orders.filter(o => isOrderDelayed(o));
        
        if (delayedOrders.length === 0) {
            return "Şu anda geciken sipariş bulunmamaktadır.";
        }
        
        return generateDelayedOrdersResponse(delayedOrders);
    }
    
    // Aktif siparişler için genel sorgu
    const activeOrders = orders.filter(o => o.status !== 'completed');
    
    if (activeOrders.length === 0) {
        return "Şu anda aktif sipariş bulunmamaktadır.";
    }
    
    return generateActiveOrdersResponse(activeOrders, queryInfo);
}

/**
 * Sipariş durumu yanıtı oluştur
 * @param {Object} order - Sipariş verisi
 * @returns {string} Oluşturulan yanıt
 */
function generateOrderStatusResponse(order) {
    // Durum açıklamaları
    const statusDesc = {
        'planning': 'Planlama aşamasında',
        'waiting': 'Malzeme tedariki bekleniyor',
        'production': 'Üretim aşamasında',
        'ready': 'Üretime hazır',
        'testing': 'Test aşamasında',
        'completed': 'Tamamlanmış'
    };
    
    // Durum metni
    const statusText = statusDesc[order.status] || 'Bilinmeyen durum';
    
    // Eksik malzeme durumu
    const hasMissingMaterials = order.hasMaterialIssue || false;
    
    // Malzemeleri kontrol et
    const materials = aiAssistantState.dataCache.materials || [];
    const orderMaterials = materials.filter(m => m.orderId === order.id);
    const missingMaterials = orderMaterials.filter(m => !m.inStock);
    
    // Yanıt oluştur
    let response = `<strong>${order.orderNo}</strong> numaralı ${order.customer} siparişi <strong>${statusText}</strong>.`;
    
    // İlerleyiş bilgisi
    if (order.status === 'production') {
        response += ` Üretim ilerleyişi: ${order.progress || "Bilinmiyor"}`;
    }
    
    // Teslim tarihi
    if (order.deliveryDate) {
        const deliveryDate = formatDate(order.deliveryDate);
        response += `<br><br>Planlanan teslim tarihi: <strong>${deliveryDate}</strong>`;
    }
    
    // Eksik malzeme durumu
    if (hasMissingMaterials || missingMaterials.length > 0) {
        response += `<br><br>⚠️ <strong>Dikkat:</strong> Bu siparişte eksik malzeme bulunmaktadır.`;
        
        if (missingMaterials.length > 0) {
            response += `<br>Eksik malzemeler:<ul>`;
            missingMaterials.forEach(material => {
                response += `<li>${material.name}</li>`;
            });
            response += `</ul>`;
        }
    }
    
    // Sipariş notları
    if (order.notes && order.notes.length > 0) {
        response += `<br><br>📝 <strong>Sipariş notları:</strong><br>`;
        order.notes.slice(0, 2).forEach(note => {
            response += `- ${note.content}<br>`;
        });
        
        if (order.notes.length > 2) {
            response += `<em>...ve ${order.notes.length - 2} not daha</em>`;
        }
    }
    
    return response;
}

/**
 * Sipariş detayları yanıtı oluştur
 * @param {Object} order - Sipariş verisi
 * @returns {string} Oluşturulan yanıt
 */
function generateOrderDetailsResponse(order) {
    // Durum açıklamaları
    const statusDesc = {
        'planning': 'Planlama aşamasında',
        'waiting': 'Malzeme tedariki bekleniyor',
        'production': 'Üretim aşamasında',
        'ready': 'Üretime hazır',
        'testing': 'Test aşamasında',
        'completed': 'Tamamlanmış'
    };
    
    // Durum metni
    const statusText = statusDesc[order.status] || 'Bilinmeyen durum';
    
    // Malzemeleri kontrol et
    const materials = aiAssistantState.dataCache.materials || [];
    const orderMaterials = materials.filter(m => m.orderId === order.id);
    const missingMaterials = orderMaterials.filter(m => !m.inStock);
    
    // Yanıt oluştur
    let response = `<div style="border-left: 4px solid #1e40af; padding-left: 10px;">
        <h3 style="margin: 0 0 10px 0;">${order.orderNo} - ${order.customer}</h3>
        <p><strong>Durum:</strong> ${statusText}</p>
        <p><strong>Hücre Tipi:</strong> ${order.cellType || "Belirtilmemiş"}</p>
        <p><strong>Hücre Sayısı:</strong> ${order.cellCount || "Belirtilmemiş"}</p>
        <p><strong>Sipariş Tarihi:</strong> ${formatDate(order.orderDate)}</p>
        <p><strong>Planlanan Teslim:</strong> ${formatDate(order.deliveryDate)}</p>
    </div>`;
    
    // Eksik malzeme durumu
    if (missingMaterials.length > 0) {
        response += `<br><div style="background-color: #fff8e1; padding: 10px; border-radius: 4px; margin-top: 10px;">
            <p><strong>⚠️ Eksik Malzemeler:</strong></p>
            <ul style="margin: 5px 0;">`;
        
        missingMaterials.forEach(material => {
            response += `<li>${material.name}`;
            
            if (material.expectedSupplyDate) {
                response += ` - Beklenen tedarik: ${formatDate(material.expectedSupplyDate)}`;
            }
            
            response += `</li>`;
        });
        
        response += `</ul></div>`;
    }
    
    // Üretim bilgisi
    const production = aiAssistantState.dataCache.production || [];
    const orderProduction = production.find(p => p.orderId === order.id);
    
    if (orderProduction) {
        response += `<br><div style="background-color: #e1f5fe; padding: 10px; border-radius: 4px; margin-top: 10px;">
            <p><strong>🏭 Üretim Bilgisi:</strong></p>
            <p>Planlanan başlangıç: ${formatDate(orderProduction.startDate)}</p>
            <p>Planlanan bitiş: ${formatDate(orderProduction.endDate)}</p>
            <p>İlerleme: ${orderProduction.progress || "0"}%</p>
        </div>`;
    }
    
    return response;
}

/**
 * Aktif siparişler yanıtı oluştur
 * @param {Array} orders - Sipariş listesi
 * @param {Object} queryInfo - Sorgu analiz bilgisi
 * @returns {string} Oluşturulan yanıt
 */
function generateActiveOrdersResponse(orders, queryInfo) {
    // Zaman filtreleme
    let filteredOrders = orders;
    
    if (queryInfo.timeframe) {
        const now = new Date();
        
        switch(queryInfo.timeframe) {
            case 'day':
                filteredOrders = orders.filter(o => {
                    const orderDate = new Date(o.orderDate?.toDate ? o.orderDate.toDate() : o.orderDate);
                    return orderDate.toDateString() === now.toDateString();
                });
                break;
            case 'week':
                const oneWeekAgo = new Date(now);
                oneWeekAgo.setDate(now.getDate() - 7);
                
                filteredOrders = orders.filter(o => {
                    const orderDate = new Date(o.orderDate?.toDate ? o.orderDate.toDate() : o.orderDate);
                    return orderDate >= oneWeekAgo;
                });
                break;
            case 'month':
                const oneMonthAgo = new Date(now);
                oneMonthAgo.setMonth(now.getMonth() - 1);
                
                filteredOrders = orders.filter(o => {
                    const orderDate = new Date(o.orderDate?.toDate ? o.orderDate.toDate() : o.orderDate);
                    return orderDate >= oneMonthAgo;
                });
                break;
            // Diğer zaman dilimleri için benzer filtreler ekleyebilirsiniz
        }
    }
    
    // Duruma göre sırala
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        // Önce geciken siparişler
        const aIsDelayed = isOrderDelayed(a);
        const bIsDelayed = isOrderDelayed(b);
        
        if (aIsDelayed && !bIsDelayed) return -1;
        if (!aIsDelayed && bIsDelayed) return 1;
        
        // Sonra teslim tarihine göre sırala
        const aDate = new Date(a.deliveryDate?.toDate ? a.deliveryDate.toDate() : a.deliveryDate);
        const bDate = new Date(b.deliveryDate?.toDate ? b.deliveryDate.toDate() : b.deliveryDate);
        
        return aDate - bDate;
    });
    
    // En fazla 5 sipariş göster
    const displayOrders = sortedOrders.slice(0, 5);
    
    // Yanıt oluştur
    let response = `<strong>Aktif Siparişler (${filteredOrders.length} adet):</strong><br><br>`;
    
    response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f8fafc;">
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Sipariş No</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Müşteri</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Durum</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Teslim</th>
        </tr>`;
    
    displayOrders.forEach(order => {
        // Durum renkleri
        const statusColors = {
            'planning': '#6b7280',
            'waiting': '#f59e0b',
            'production': '#3b82f6',
            'ready': '#10b981',
            'testing': '#8b5cf6',
            'completed': '#1f2937'
        };
        
        // Durum açıklamaları
        const statusDesc = {
            'planning': 'Planlama',
            'waiting': 'Malzeme Bekleniyor',
            'production': 'Üretimde',
            'ready': 'Hazır',
            'testing': 'Test',
            'completed': 'Tamamlandı'
        };
        
        const isDelayed = isOrderDelayed(order);
        const rowStyle = isDelayed ? 'background-color: #fff5f5;' : '';
        
        response += `<tr style="${rowStyle}">
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.orderNo}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.customer}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; background-color: ${statusColors[order.status] || '#6b7280'}; color: white;">
                    ${statusDesc[order.status] || 'Bilinmiyor'}
                </span>
                ${isDelayed ? ' <span style="color: #ef4444; font-size: 12px;">&#9888; Gecikme</span>' : ''}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(order.deliveryDate)}</td>
        </tr>`;
    });
    
    response += `</table></div>`;
    
    // Daha fazla sipariş olduğunu belirt
    if (filteredOrders.length > displayOrders.length) {
        response += `<br><em>...ve ${filteredOrders.length - displayOrders.length} sipariş daha</em>`;
    }
    
    // Gecikme özeti
    const delayedOrders = filteredOrders.filter(o => isOrderDelayed(o));
    
    if (delayedOrders.length > 0) {
        response += `<br><br>⚠️ <strong>${delayedOrders.length} sipariş gecikmiş durumda.</strong> Daha detaylı bilgi için "geciken siparişler" yazabilirsiniz.`;
    }
    
    return response;
}

/**
 * Gecikmiş siparişler yanıtı oluştur
 * @param {Array} orders - Gecikmiş sipariş listesi
 * @param {string} customer - Müşteri adı (opsiyonel)
 * @returns {string} Oluşturulan yanıt
 */
function generateDelayedOrdersResponse(orders, customer = null) {
    // Müşteri filtresi varsa uygula
    let filteredOrders = orders;
    if (customer) {
        filteredOrders = orders.filter(o => o.customer === customer);
    }
    
    // Teslim tarihine göre sırala
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const aDate = new Date(a.deliveryDate?.toDate ? a.deliveryDate.toDate() : a.deliveryDate);
        const bDate = new Date(b.deliveryDate?.toDate ? b.deliveryDate.toDate() : b.deliveryDate);
        
        return aDate - bDate;
    });
    
    // Başlık
    let response = customer 
        ? `<strong>${customer} Müşterisine Ait Geciken Siparişler (${filteredOrders.length} adet):</strong><br><br>`
        : `<strong>Geciken Siparişler (${filteredOrders.length} adet):</strong><br><br>`;
    
    // Tablo oluştur
    response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f8fafc;">
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Sipariş No</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Müşteri</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Teslim Tarihi</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Gecikme</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Durum</th>
        </tr>`;
    
    sortedOrders.forEach(order => {
        // Durum açıklamaları
        const statusDesc = {
            'planning': 'Planlama',
            'waiting': 'Malzeme Bekleniyor',
            'production': 'Üretimde',
            'ready': 'Hazır',
            'testing': 'Test',
            'completed': 'Tamamlandı'
        };
        
        // Gecikme süresini hesapla
        const deliveryDate = new Date(order.deliveryDate?.toDate ? order.deliveryDate.toDate() : order.deliveryDate);
        const today = new Date();
        const delayDays = Math.floor((today - deliveryDate) / (1000 * 60 * 60 * 24));
        
        // Gecikme sebebi
        let delayReason = '';
        if (order.status === 'waiting') {
            delayReason = 'Malzeme tedarik sorunu';
        } else if (order.status === 'production') {
            delayReason = 'Üretim gecikmesi';
        } else {
            delayReason = 'Belirtilmemiş';
        }
        
        response += `<tr style="background-color: #fff5f5;">
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.orderNo}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.customer}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(order.deliveryDate)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #ef4444;"><strong>${delayDays} gün</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${statusDesc[order.status] || 'Bilinmiyor'}</td>
        </tr>`;
    });
    
    response += `</table></div>`;
    
    // Gecikme nedenleri özeti
    const waitingOrders = sortedOrders.filter(o => o.status === 'waiting').length;
    const productionOrders = sortedOrders.filter(o => o.status === 'production').length;
    
    response += `<br><strong>Gecikme Nedenleri:</strong><br>`;
    
    if (waitingOrders > 0) {
        response += `- Malzeme bekleniyor: ${waitingOrders} sipariş<br>`;
    }
    
    if (productionOrders > 0) {
        response += `- Üretim gecikmesi: ${productionOrders} sipariş<br>`;
    }
    
    return response;
}

/**
 * Müşteri siparişleri yanıtı oluştur
 * @param {Array} orders - Müşteriye ait sipariş listesi
 * @returns {string} Oluşturulan yanıt
 */
function generateCustomerOrdersResponse(orders) {
    const customer = orders[0].customer;
    
    // Teslim tarihine göre sırala
    const sortedOrders = [...orders].sort((a, b) => {
        const aDate = new Date(a.deliveryDate?.toDate ? a.deliveryDate.toDate() : a.deliveryDate);
        const bDate = new Date(b.deliveryDate?.toDate ? b.deliveryDate.toDate() : b.deliveryDate);
        
        return aDate - bDate;
    });
    
    // Yanıt başlığı
    let response = `<strong>${customer} Müşterisine Ait Siparişler (${orders.length} adet):</strong><br><br>`;
    
    // Tablo oluştur
    response += `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f8fafc;">
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Sipariş No</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Hücre Tipi</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Adet</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Durum</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Teslim</th>
        </tr>`;
    
    sortedOrders.forEach(order => {
        // Durum renkleri
        const statusColors = {
            'planning': '#6b7280',
            'waiting': '#f59e0b',
            'production': '#3b82f6',
            'ready': '#10b981',
            'testing': '#8b5cf6',
            'completed': '#1f2937'
        };
        
        // Durum açıklamaları
        const statusDesc = {
            'planning': 'Planlama',
            'waiting': 'Malzeme Bekleniyor',
            'production': 'Üretimde',
            'ready': 'Hazır',
            'testing': 'Test',
            'completed': 'Tamamlandı'
        };
        
        const isDelayed = isOrderDelayed(order);
        const rowStyle = isDelayed ? 'background-color: #fff5f5;' : '';
        
        response += `<tr style="${rowStyle}">
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.orderNo}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.cellType || "Belirtilmemiş"}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${order.cellCount || "1"}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; background-color: ${statusColors[order.status] || '#6b7280'}; color: white;">
                    ${statusDesc[order.status] || 'Bilinmiyor'}
                </span>
                ${isDelayed ? ' <span style="color: #ef4444; font-size: 12px;">&#9888; Gecikme</span>' : ''}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(order.deliveryDate)}</td>
        </tr>`;
    });
    
    response += `</table></div>`;
    
    // Özet bilgi
    const activeOrders = sortedOrders.filter(o => o.status !== 'completed').length;
    const delayedOrders = sortedOrders.filter(o => isOrderDelayed(o)).length;
    
    response += `<br><strong>Özet:</strong><br>`;
    response += `- Toplam sipariş: ${orders.length}<br>`;
    response += `- Aktif sipariş: ${activeOrders}<br>`;
    
    if (delayedOrders > 0) {
        response += `- Geciken sipariş: <span style="color: #ef4444;">${delayedOrders}</span><br>`;
    }
    
    return response;
}
