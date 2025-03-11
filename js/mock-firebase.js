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
            this.firestore.data[this.collectionName] = [];
        }
        
        const now = new Date();
        const newData = {
            ...data,
            id: this.id || ('mock-' + Math.random().toString(36).substr(2, 9)),
            updatedAt: data.updatedAt || now
        };
        
        if (!this.id) {
            this.id = newData.id;
            newData.createdAt = data.createdAt || now;
            this.firestore.data[this.collectionName].push(newData);
        } else {
            const index = this.firestore.data[this.collectionName].findIndex(item => item.id === this.id);
            if (index !== -1) {
                this.firestore.data[this.collectionName][index] = {
                    ...this.firestore.data[this.collectionName][index],
                    ...newData
                };
            } else {
                newData.createdAt = data.createdAt || now;
                this.firestore.data[this.collectionName].push(newData);
            }
        }
        
        return Promise.resolve();
    }
    
    async update(data) {
        if (!this.id) {
            throw new Error('Document ID is required for update');
        }
        
        if (!this.firestore.data[this.collectionName]) {
            throw new Error(`Collection ${this.collectionName} does not exist`);
        }
        
        const index = this.firestore.data[this.collectionName].findIndex(item => item.id === this.id);
        if (index === -1) {
            throw new Error(`Document with ID ${this.id} does not exist in ${this.collectionName}`);
        }
        
        this.firestore.data[this.collectionName][index] = {
            ...this.firestore.data[this.collectionName][index],
            ...data,
            updatedAt: data.updatedAt || new Date()
        };
        
        return Promise.resolve();
    }
    
    async delete() {
        if (!this.id) {
            throw new Error('Document ID is required for delete');
        }
        
        if (!this.firestore.data[this.collectionName]) {
            return Promise.resolve();
        }
        
        const index = this.firestore.data[this.collectionName].findIndex(item => item.id === this.id);
        if (index !== -1) {
            this.firestore.data[this.collectionName].splice(index, 1);
        }
        
        return Promise.resolve();
    }
}

class MockQuery {
    constructor(firestore, collectionName, filters = [], orderByParams = [], limitVal = null) {
        this.firestore = firestore;
        this.collectionName = collectionName;
        this.filters = filters;
        this.orderByParams = orderByParams;
        this.limitVal = limitVal;
    }
    
    where(field, op, value) {
        return new MockQuery(
            this.firestore,
            this.collectionName,
            [...this.filters, { field, op, value }],
            this.orderByParams,
            this.limitVal
        );
    }
    
    orderBy(field, dir = 'asc') {
        return new MockQuery(
            this.firestore,
            this.collectionName,
            this.filters,
            [...this.orderByParams, { field, dir }],
            this.limitVal
        );
    }
    
    limit(limitVal) {
        return new MockQuery(
            this.firestore,
            this.collectionName,
            this.filters,
            this.orderByParams,
            limitVal
        );
    }
    
    async get() {
        let data = this.firestore.data[this.collectionName] || [];
        
        // Filtreleri uygula
        this.filters.forEach(filter => {
            const { field, op, value } = filter;
            
            data = data.filter(item => {
                const fieldValue = this._getNestedValue(item, field);
                
                switch (op) {
                    case '==':
                        if (fieldValue instanceof Date && value instanceof Date) {
                            return fieldValue.getTime() === value.getTime();
                        }
                        return fieldValue === value;
                    case '!=':
                        return fieldValue !== value;
                    case '>':
                        return fieldValue > value;
                    case '>=':
                        return fieldValue >= value;
                    case '<':
                        return fieldValue < value;
                    case '<=':
                        return fieldValue <= value;
                    case 'in':
                        return Array.isArray(value) && value.includes(fieldValue);
                    case 'array-contains':
                        return Array.isArray(fieldValue) && fieldValue.includes(value);
                    case 'array-contains-any':
                        return Array.isArray(fieldValue) && Array.isArray(value) && value.some(v => fieldValue.includes(v));
                    default:
                        return true;
                }
            });
        });
        
        // Sıralama uygula
        if (this.orderByParams.length > 0) {
            data.sort((a, b) => {
                for (const { field, dir } of this.orderByParams) {
                    const aValue = this._getNestedValue(a, field);
                    const bValue = this._getNestedValue(b, field);
                    
                    if (aValue === bValue) continue;
                    
                    // Tarih karşılaştırması
                    if (aValue instanceof Date && bValue instanceof Date) {
                        return dir === 'asc' 
                            ? aValue.getTime() - bValue.getTime()
                            : bValue.getTime() - aValue.getTime();
                    }
                    
                    // Metin karşılaştırması
                    if (typeof aValue === 'string' && typeof bValue === 'string') {
                        const result = aValue.localeCompare(bValue);
                        return dir === 'asc' ? result : -result;
                    }
                    
                    // Sayı karşılaştırması
                    return dir === 'asc' 
                        ? (aValue > bValue ? 1 : -1)
                        : (aValue > bValue ? -1 : 1);
                }
                return 0;
            });
        }
        
        // Limit uygula
        if (this.limitVal !== null && this.limitVal > 0) {
            data = data.slice(0, this.limitVal);
        }
        
        // Sonuçları döndür
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
    
    _getNestedValue(obj, path) {
        const parts = path.split('.');
        let value = obj;
        
        for (const part of parts) {
            if (value === null || value === undefined) return undefined;
            value = value[part];
        }
        
        return value;
    }
}

class MockAuth {
    constructor() {
        this.currentUser = null;
        this.listeners = [];
        console.log('Mock Auth initialized in demo mode');
    }
    
    async signInWithEmailAndPassword(email, password) {
        // Demo için her zaman başarılı olsun
        if (email === 'demo@elektrotrack.com' && password === 'demo123') {
            this.currentUser = {
                uid: 'demo-user-1',
                email: 'demo@elektrotrack.com',
                displayName: 'Demo Kullanıcı',
                emailVerified: true
            };
        } else {
            this.currentUser = {
                uid: 'user-' + Math.random().toString(36).substr(2, 9),
                email: email,
                displayName: email.split('@')[0],
                emailVerified: true
            };
        }
        
        // Otomatik otomatik oturum açılma bildirimini tetikle
        this._notifyAuthStateChanged();
        
        // Demo mod bildirimini göster
        const demoModeNotification = document.getElementById('demo-mode-notification');
        if (demoModeNotification) {
            demoModeNotification.style.display = 'block';
        }
        
        return {
            user: this.currentUser
        };
    }
    
    async createUserWithEmailAndPassword(email, password) {
        this.currentUser = {
            uid: 'user-' + Math.random().toString(36).substr(2, 9),
            email: email,
            displayName: null,
            emailVerified: false
        };
        
        this._notifyAuthStateChanged();
        
        return {
            user: this.currentUser
        };
    }
    
    async sendPasswordResetEmail(email) {
        console.log(`Mock: Şifre sıfırlama e-postası gönderildi: ${email}`);
        return Promise.resolve();
    }
    
    async signOut() {
        this.currentUser = null;
        this._notifyAuthStateChanged();
        return Promise.resolve();
    }
    
    onAuthStateChanged(callback) {
        this.listeners.push(callback);
        
        // Hemen mevcut durumu bildir
        if (callback) {
            setTimeout(() => callback(this.currentUser), 0);
        }
        
        // Temizleme fonksiyonu döndür
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }
    
    _notifyAuthStateChanged() {
        this.listeners.forEach(callback => {
            if (callback) {
                setTimeout(() => callback(this.currentUser), 0);
            }
        });
    }
    
    // Diğer Auth metotları
    EmailAuthProvider = {
        credential: (email, password) => ({ email, password })
    };
}

// Firebase mock'u başlat
function initMockFirebase() {
    // Gerçek Firebase'in varlığını kontrol et
    if (typeof firebase !== 'undefined') {
        console.log('Gerçek Firebase bulundu, mock kullanılmayacak');
        return false;
    }
    
    // Global firebase objesi oluştur
    window.firebase = {
        initializeApp: (config) => {
            console.log('Mock Firebase initialized with config', config);
            return window.firebase;
        },
        app: () => window.firebase,
        auth: () => window.firebase._authInstance || (window.firebase._authInstance = new MockAuth()),
        firestore: () => window.firebase._firestoreInstance || (window.firebase._firestoreInstance = new MockFirestore()),
        analytics: () => ({
            logEvent: (name, params) => console.log(`Mock Analytics: ${name}`, params)
        }),
        
        // Compat modüllerini de mockla
        signInWithEmailAndPassword: (email, password) => window.firebase.auth().signInWithEmailAndPassword(email, password),
        createUserWithEmailAndPassword: (email, password) => window.firebase.auth().createUserWithEmailAndPassword(email, password),
        sendPasswordResetEmail: (email) => window.firebase.auth().sendPasswordResetEmail(email),
        signOut: () => window.firebase.auth().signOut(),
        collection: (path) => window.firebase.firestore().collection(path),
        doc: (collection, docId) => docId ? window.firebase.firestore().collection(collection).doc(docId) : window.firebase.firestore().doc(collection),
        setDoc: (docRef, data) => docRef.set(data),
        getDoc: (docRef) => docRef.get(),
        getDocs: (query) => query.get(),
        query: (collRef) => collRef,
        where: (field, op, value) => window.firebase.firestore().where(field, op, value),
        serverTimestamp: () => window.firebase.firestore().FieldValue.serverTimestamp(),
        arrayUnion: (...elements) => window.firebase.firestore().FieldValue.arrayUnion(...elements),
        increment: (n) => window.firebase.firestore().FieldValue.increment(n)
    };
    
    console.log('Mock Firebase başarıyla oluşturuldu');
    return true;
}

// Sayfaya eklendiğinde mock Firebase'i başlat
(function() {
    // Sayfa yüklendiğinde initialize et
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initMockFirebase, 1000); // Gerçek Firebase'in yüklenmesi için bir saniye bekle
    } else {
        window.addEventListener('DOMContentLoaded', function() {
            setTimeout(initMockFirebase, 1000);
        });
    }
})();
