/**
 * mock-firebase.js
 * Demo modu için sahte Firebase implementasyonu
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

// Firebase Timestamp Simulasyonu
class MockTimestamp {
    constructor(seconds, nanoseconds = 0) {
        this.seconds = seconds;
        this.nanoseconds = nanoseconds;
    }

    toDate() {
        return new Date(this.seconds * 1000);
    }

    static now() {
        return new MockTimestamp(Math.floor(Date.now() / 1000));
    }

    static fromDate(date) {
        return new MockTimestamp(Math.floor(date.getTime() / 1000));
    }
}

// Mock Firebase Auth
class MockAuth {
    constructor() {
        this.currentUser = null;
        this.listeners = [];
    }

    onAuthStateChanged(listener) {
        this.listeners.push(listener);
        // Hemen mevcut durumu bildir
        setTimeout(() => {
            listener(this.currentUser);
        }, 0);
        
        // Temizleme fonksiyonu
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    async signInWithEmailAndPassword(email, password) {
        // Demo hesap kontrolü
        if (email === 'demo@elektrotrack.com' && password === 'demo123') {
            this.currentUser = {
                uid: 'demo-user-1',
                email: 'demo@elektrotrack.com',
                displayName: 'Demo Kullanıcı',
                emailVerified: true
            };
            
            // Dinleyicileri bilgilendir
            this.listeners.forEach(listener => listener(this.currentUser));
            
            return { 
                user: this.currentUser,
                operationType: 'signIn'
            };
        }
        
        throw new Error('auth/user-not-found');
    }

    async signOut() {
        this.currentUser = null;
        
        // Dinleyicileri bilgilendir
        this.listeners.forEach(listener => listener(null));
        
        return true;
    }
}

// Mock Firestore
class MockFirestore {
    constructor() {
        this.data = JSON.parse(JSON.stringify(mockData));
        
        // Date nesnelerini geri çevir
        this.convertDatesToObjects(this.data);
        
        console.log('Mock Firestore initialized in demo mode');
        
        // FieldValue simulasyonu
        this.FieldValue = {
            serverTimestamp: () => ({
                _isServerTimestamp: true,
                toDate: () => new Date()
            }),
            arrayUnion: (...elements) => ({
                _isArrayUnion: true,
                elements
            }),
            arrayRemove: (...elements) => ({
                _isArrayRemove: true,
                elements
            }),
            increment: (n) => ({
                _isIncrement: true,
                value: n
            }),
            delete: () => ({
                _isDelete: true
            })
        };
        
        // Timestamp
        this.Timestamp = MockTimestamp;
    }

    // Date stringlerini Date nesnelerine çevir
    convertDatesToObjects(obj) {
        if (!obj) return;
        
        for (let key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
                if (obj[key] instanceof Array) {
                    obj[key].forEach(item => this.convertDatesToObjects(item));
                } else {
                    this.convertDatesToObjects(obj[key]);
                }
            }
        }
