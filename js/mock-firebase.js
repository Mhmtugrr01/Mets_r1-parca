/*
    BU DOSYA, kod-1 ve kod-2'yi BİRLEŞTİRİR.
    "Kapsam azaltma olmasın" talebine uygun biçimde
    her iki koddaki TÜM içeriği korur.

    Olası çakışmaları önlemek için:
    - Değişken, sınıf ve fonksiyon adlarına "KOD1" / "KOD2" ekledik.
    - Tek bir dosya içinde iki ayrı "parça" gibi davranırlar.
*/

/******************************************
 * BÖLÜM A: kod-1 (mock-firebase-KOD1.js)
 ******************************************/

// Mock veri (KOD1)
const mockDataKOD1 = {
    users: [
        {
            id: 'demo-user-1',
            email: 'demo@elektrotrack.com',
            name: 'Demo Kullanıcı',
            department: 'Yönetim',
            role: 'admin',
            createdAt: new Date('2024-01-01')
        }
    ],
    orders: [
        {
            id: 'order-1',
            orderNo: '24-03-A001',
            customer: 'AYEDAŞ',
            cellType: 'RM 36 LB',
            cellCount: 3,
            orderDate: new Date('2024-02-15'),
            deliveryDate: new Date('2024-05-20'),
            status: 'production',
            hasMaterialIssue: false,
            hasWarning: true,
            createdAt: new Date('2024-02-15'),
            updatedAt: new Date('2024-03-01')
        },
        {
            id: 'order-2',
            orderNo: '24-03-B002',
            customer: 'BAŞKENT EDAŞ',
            cellType: 'RM 36 FL',
            cellCount: 5,
            orderDate: new Date('2024-02-20'),
            deliveryDate: new Date('2024-05-15'),
            status: 'waiting',
            hasMaterialIssue: true,
            hasWarning: false,
            createdAt: new Date('2024-02-20'),
            updatedAt: new Date('2024-02-28')
        },
        {
            id: 'order-3',
            orderNo: '24-03-C003',
            customer: 'ENERJİSA',
            cellType: 'RM 36 CB',
            cellCount: 4,
            orderDate: new Date('2024-02-25'),
            deliveryDate: new Date('2024-06-10'),
            status: 'ready',
            hasMaterialIssue: false,
            hasWarning: false,
            createdAt: new Date('2024-02-25'),
            updatedAt: new Date('2024-03-05')
        },
        {
            id: 'order-4',
            orderNo: '24-04-D004',
            customer: 'TOROSLAR EDAŞ',
            cellType: 'RM 36 LB',
            cellCount: 8,
            orderDate: new Date('2024-03-01'),
            deliveryDate: new Date('2024-06-25'),
            status: 'planning',
            hasMaterialIssue: false,
            hasWarning: false,
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date('2024-03-01')
        },
        {
            id: 'order-5',
            orderNo: '24-04-E005',
            customer: 'AYEDAŞ',
            cellType: 'RM 36 CB',
            cellCount: 6,
            orderDate: new Date('2024-03-05'),
            deliveryDate: new Date('2024-07-10'),
            status: 'planning',
            hasMaterialIssue: false,
            hasWarning: false,
            createdAt: new Date('2024-03-05'),
            updatedAt: new Date('2024-03-05')
        }
    ],
    materials: [
        {
            id: 'material-1',
            code: 'M480TB/G-027-95.300UN5',
            name: 'Kablo Başlıkları',
            orderId: 'order-2',
            orderNo: '24-03-B002',
            quantity: 10,
            unit: 'Adet',
            inStock: false,
            status: 'ordered',
            supplier: 'Euromold',
            minStock: 5,
            expectedSupplyDate: new Date('2024-05-01'),
            orderNeedDate: new Date('2024-04-20')
        },
        {
            id: 'material-2',
            code: 'OVI+S (10nf)',
            name: 'Gerilim Gösterge',
            orderId: 'order-2',
            orderNo: '24-03-B002',
            quantity: 5,
            unit: 'Adet',
            inStock: false,
            status: 'ordered',
            supplier: 'Elektra',
            minStock: 3,
            expectedSupplyDate: new Date('2024-04-28'),
            orderNeedDate: new Date('2024-04-25')
        },
        {
            id: 'material-3',
            code: 'Siemens 7SR1003-1JA20-2DA0+ZY20',
            name: 'Koruma Rölesi',
            orderId: 'order-1',
            orderNo: '24-03-A001',
            quantity: 3,
            unit: 'Adet',
            inStock: true,
            status: 'available',
            supplier: 'Siemens',
            minStock: 2
        }
    ],
    customers: [
        { id: 'customer-1', name: 'AYEDAŞ', contact: 'Ahmet Yılmaz', email: 'ahmet@ayedas.com.tr', phone: '0212 555 11 22' },
        { id: 'customer-2', name: 'ENERJİSA', contact: 'Mehmet Kaya', email: 'mehmet@enerjisa.com.tr', phone: '0216 333 44 55' },
        { id: 'customer-3', name: 'BAŞKENT EDAŞ', contact: 'Ayşe Demir', email: 'ayse@baskentedas.com.tr', phone: '0312 444 77 88' },
        { id: 'customer-4', name: 'TOROSLAR EDAŞ', contact: 'Fatma Şahin', email: 'fatma@toroslar.com.tr', phone: '0322 666 99 00' }
    ],
    notes: [
        {
            id: 'note-1',
            entityType: 'order',
            entityId: 'order-1',
            content: 'Müşteri ile yapılan görüşmede, teslimat tarihinin çok kritik olduğu vurgulandı.',
            type: 'general',
            createdAt: new Date('2024-03-10'),
            createdBy: {
                uid: 'demo-user-1',
                name: 'Demo Kullanıcı',
                department: 'Yönetim'
            }
        },
        {
            id: 'note-2',
            entityType: 'order',
            entityId: 'order-2',
            content: 'Gerilim gösterge malzemesinin tedarikinde gecikme riski var. Alternatif tedarikçi araştırılıyor.',
            type: 'warning',
            createdAt: new Date('2024-03-12'),
            createdBy: {
                uid: 'demo-user-1',
                name: 'Demo Kullanıcı',
                department: 'Yönetim'
            }
        }
    ]
};

/*****************************************
    Kod-1'de kullanılan class ve fonksiyonları
    ayırmak için "KOD1" ekliyoruz.
*****************************************/

class MockFirestoreKOD1 {
    constructor() {
        this.data = JSON.parse(JSON.stringify(mockDataKOD1));
        console.log('(KOD1) Mock Firestore initialized in demo mode');
    }

    collection(collectionName) {
        return new MockCollectionKOD1(this, collectionName);
    }

    doc(path) {
        if (path.includes('/')) {
            const [collectionName, docId] = path.split('/');
            return new MockDocumentReferenceKOD1(this, collectionName, docId);
        }
        return new MockDocumentReferenceKOD1(this, path);
    }
}

class MockCollectionKOD1 {
    constructor(firestore, collectionName) {
        this.firestore = firestore;
        this.collectionName = collectionName;
    }

    doc(docId) {
        return new MockDocumentReferenceKOD1(this.firestore, this.collectionName, docId);
    }

    async get() {
        const data = this.firestore.data[this.collectionName] || [];
        const docs = data.map(item => ({
            id: item.id,
            data: () => ({ ...item }),
            exists: true
        }));

        return {
            empty: docs.length === 0,
            size: docs.length,
            docs: docs,
            forEach: (callback) => docs.forEach(callback)
        };
    }
}

class MockDocumentReferenceKOD1 {
    constructor(firestore, collectionName, docId) {
        this.firestore = firestore;
        this.collectionName = collectionName;
        this.id = docId;
    }

    async get() {
        if (!this.id) {
            throw new Error('(KOD1) Document ID is required');
        }
        const collection = this.firestore.data[this.collectionName] || [];
        const doc = collection.find(item => item.id === this.id);

        if (!doc) {
            return {
                exists: false,
                data: () => null,
                id: this.id
            };
        }
        return {
            exists: true,
            data: () => ({ ...doc }),
            id: this.id
        };
    }
}

// (KOD1) initMockFirebase benzeri
function initMockFirebaseKOD1() {
    // Gerçek Firebase'in varlığını kontrol et
    if (typeof firebase !== 'undefined' && firebase.firestore && !firebase._firestoreInstanceKOD1) {
        console.log('(KOD1) Gerçek Firebase bulundu, mock kullanılmayacak');
        return false;
    }

    // Global firebase objesi oluştur
    window.firebaseKOD1 = {
        _firestoreInstanceKOD1: new MockFirestoreKOD1()
    };

    console.log('(KOD1) Mock Firebase başarıyla oluşturuldu');
    return true;
}

/**************************************
 * BÖLÜM B: kod-2 (mock-firebase-KOD2.js)
 **************************************/

const mockDataKOD2 = {
    users: [...mockDataKOD1.users],
    orders: [...mockDataKOD1.orders],
    materials: [...mockDataKOD1.materials],
    customers: [...mockDataKOD1.customers],
    notes: [...mockDataKOD1.notes]
    // Yukarıdaki satır: Aynı verileri korumak adına
};

// KOD2 class'ları
class MockFirestoreKOD2 {
    constructor() {
        this.data = JSON.parse(JSON.stringify(mockDataKOD2));
        console.log('(KOD2) Mock Firestore initialized in demo mode');
    }

    collection(collectionName) {
        return new MockCollectionKOD2(this, collectionName);
    }

    doc(path) {
        if (path.includes('/')) {
            const [collectionName, docId] = path.split('/');
            return new MockDocumentReferenceKOD2(this, collectionName, docId);
        }
        return new MockDocumentReferenceKOD2(this, path);
    }
}

class MockCollectionKOD2 {
    constructor(firestore, collectionName) {
        this.firestore = firestore;
        this.collectionName = collectionName;
    }

    doc(docId) {
        return new MockDocumentReferenceKOD2(this.firestore, this.collectionName, docId);
    }

    async get() {
        const data = this.firestore.data[this.collectionName] || [];
        const docs = data.map(item => ({
            id: item.id,
            data: () => ({ ...item }),
            exists: true
        }));
        return {
            empty: docs.length === 0,
            size: docs.length,
            docs: docs,
            forEach: (callback) => docs.forEach(callback)
        };
    }
}

class MockDocumentReferenceKOD2 {
    constructor(firestore, collectionName, docId) {
        this.firestore = firestore;
        this.collectionName = collectionName;
        this.id = docId;
    }

    async get() {
        if (!this.id) {
            throw new Error('(KOD2) Document ID is required');
        }
        const collection = this.firestore.data[this.collectionName] || [];
        const doc = collection.find(item => item.id === this.id);
        if (!doc) {
            return {
                exists: false,
                data: () => null,
                id: this.id
            };
        }
        return {
            exists: true,
            data: () => ({ ...doc }),
            id: this.id
        };
    }
}

function initMockFirebaseKOD2() {
    if (typeof firebase !== 'undefined' && firebase.firestore && !firebase._firestoreInstanceKOD2) {
        console.log('(KOD2) Gerçek Firebase bulundu, mock kullanılmayacak');
        return false;
    }

    window.firebaseKOD2 = {
        _firestoreInstanceKOD2: new MockFirestoreKOD2()
    };

    console.log('(KOD2) Mock Firebase başarıyla oluşturuldu');
    return true;
}

/**************************************
 * TEK DOSYA HALİNDE ÇALIŞTIRMA
 **************************************/

(function() {
    // Burada KOD1 ve KOD2'yi aynı anda init edebiliriz
    // Ama her ikisinin de global namespace'leri farklı

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => {
            initMockFirebaseKOD1();
            initMockFirebaseKOD2();
        }, 1000);
    } else {
        window.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                initMockFirebaseKOD1();
                initMockFirebaseKOD2();
            }, 1000);
        });
    }
})();
