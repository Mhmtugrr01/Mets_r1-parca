/**
 * mock-firebase.js
 * Firebase API'lerinin mock implementation'ı (Demo ve Netlify ortamı için)
 * Bu script, Firebase erişimi olmayan durumlarda uygulamanın çalışmaya devam etmesini sağlar
 */

// Mock veri
const mockData = {
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

// Mock sınıflar
class MockFirestore {
    constructor() {
        this.data = JSON.parse(JSON.stringify(mockData));
        console.log('Mock Firestore initialized in demo mode');
    }
    
    collection(collectionName) {
        return new MockCollection(this, collectionName);
    }
    
    doc(path) {
        if (path.includes('/')) {
            const [collectionName, docId] = path.split('/');
            return new MockDocumentReference(this, collectionName, docId);
        }
        return new MockDocumentReference(this, path);
    }
    
    FieldValue = {
        serverTimestamp: () => new Date(),
        arrayUnion: (...elements) => elements,
        increment: (n) => n
    };
    
    Timestamp = {
        fromDate: (date) => date,
        now: () => new Date()
    };
    
    where = (field, op, value) => ({ field, op, value });
    
    orderBy = (field, dir) => ({ field, dir });
    
    limit = (n) => ({ limit: n });
}

class MockCollection {
    constructor(firestore, collectionName) {
        this.firestore = firestore;
        this.collectionName = collectionName;
    }
    
    doc(docId) {
        return new MockDocumentReference(this.firestore, this.collectionName, docId);
    }
    
    where(field, op, value) {
        return new MockQuery(this.firestore, this.collectionName, [{ field, op, value }]);
    }
    
    orderBy(field, dir = 'asc') {
        return new MockQuery(this.firestore, this.collectionName, [], [{ field, dir }]);
    }
    
    limit(limitVal) {
        return new MockQuery(this.firestore, this.collectionName, [], [], limitVal);
    }
    
    async add(data) {
        const id = 'mock-' + Math.random().toString(36).substr(2, 9);
        const docRef = this.doc(id);
        await docRef.set(data);
        return {
            id: id,
            ...docRef
        };
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

class MockDocumentReference {
    constructor(firestore, collectionName, docId) {
        this.firestore = firestore;
        this.collectionName = collectionName;
        this.id = docId;
    }
    
    async get() {
        if (!this.id) {
            throw new Error('Document ID is required');
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
    
    async set(data, options) {
        if (!this.firestore.data[this.collectionName]) {
            this.firestore.data[this.coll
