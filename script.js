// Local Storage Management
class LocalStorageManager {
    constructor() {
        this.usersKey = 'ecommerce_users';
        this.currentUserKey = 'ecommerce_current_user';
        this.productsKey = 'ecommerce_products';
        this.initSampleData();
    }

    initSampleData() {
        // Initialize sample users if none exist
        if (!this.getUsers().length) {
            const sampleUsers = [
                {
                    id: 1,
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'admin123',
                    role: 'admin',
                    department: 'electronics',
                    avatar: 'AU'
                },
                {
                    id: 2,
                    name: 'John Agent',
                    email: 'agent@example.com',
                    password: 'agent123',
                    role: 'agent',
                    department: 'fashion',
                    avatar: 'JA'
                }
            ];
            localStorage.setItem(this.usersKey, JSON.stringify(sampleUsers));
        }

        // Initialize sample products if none exist
        if (!this.getProducts().length) {
            const sampleProducts = [
                {
                    id: 1,
                    name: 'Gaming Laptop Pro',
                    price: 1299.99,
                    sku: 'LP-001',
                    status: 'published',
                    stock: 45,
                    lowStockThreshold: 10,
                    category: 'electronics'
                },
                {
                    id: 2,
                    name: 'Wireless Headphones',
                    price: 199.99,
                    sku: 'HP-042',
                    status: 'pending_approval',
                    stock: 25,
                    lowStockThreshold: 15,
                    category: 'electronics'
                },
                {
                    id: 3,
                    name: 'Smartphone X',
                    price: 899.99,
                    sku: 'SP-128',
                    status: 'approved',
                    stock: 30,
                    lowStockThreshold: 10,
                    category: 'electronics'
                },
                {
                    id: 4,
                    name: 'Smart Watch',
                    price: 299.99,
                    sku: 'SW-099',
                    status: 'draft',
                    stock: 0,
                    lowStockThreshold: 5,
                    category: 'electronics'
                }
            ];
            localStorage.setItem(this.productsKey, JSON.stringify(sampleProducts));
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey)) || [];
    }

    saveUser(user) {
        const users = this.getUsers();
        user.id = Date.now(); // Simple ID generation
        users.push(user);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        return user;
    }

    findUser(email, password) {
        const users = this.getUsers();
        return users.find(user => user.email === email && user.password === password);
    }

    setCurrentUser(user) {
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.currentUserKey));
    }

    clearCurrentUser() {
        localStorage.removeItem(this.currentUserKey);
    }

    getProducts() {
        return JSON.parse(localStorage.getItem(this.productsKey)) || [];
    }

    saveProduct(product) {
        const products = this.getProducts();
        product.id = Date.now();
        products.push(product);
        localStorage.setItem(this.productsKey, JSON.stringify(products));
        return product;
    }

    updateProduct(updatedProduct) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct };
            localStorage.setItem(this.productsKey, JSON.stringify(products));
        }
    }

    updateProductStatus(productId, newStatus) {
        const products = this.getProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            product.status = newStatus;
            localStorage.setItem(this.productsKey, JSON.stringify(products));
        }
    }
}

// Application State Management
class EcommerceApp {
    constructor() {
        this.storage = new LocalStorageManager();
        this.currentScreen = 'dashboard';
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.loadDashboardData();
    }

    checkAuthentication() {
        const currentUser = this.storage.getCurrentUser();
        if (currentUser) {
            this.showDashboard(currentUser);
        } else {
            this.showAuthScreen();
        }
    }

    showAuthScreen() {
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showDashboard(user) {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        this.updateUserInfo(user);
        this.setupRoleBasedAccess(user.role);
        this.showScreen('dashboard');
    }

    updateUserInfo(user) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userRole').textContent = this.formatRole(user.role);
        document.getElementById('userAvatar').textContent = user.avatar || user.name.split(' ').map(n => n[0]).join('');
    }

    formatRole(role) {
        const roles = {
            'admin': 'Administrator',
            'agent': 'E-commerce Agent',
            'customer': 'Customer'
        };
        return roles[role] || role;
    }

    setupRoleBasedAccess(role) {
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        const adminAgentElements = document.querySelectorAll('.admin-agent-only');
        
        adminOnlyElements.forEach(el => {
            el.style.display = role === 'admin' ? 'flex' : 'none';
        });

        adminAgentElements.forEach(el => {
            el.style.display = (role === 'admin' || role === 'agent') ? 'flex' : 'none';
        });
    }

    setupEventListeners() {
        // Authentication tabs
        document.getElementById('loginTab').addEventListener('click', () => this.switchAuthTab('login'));
        document.getElementById('signupTab').addEventListener('click', () => this.switchAuthTab('signup'));

        // Auth forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));

        // Role selection for department visibility
        document.getElementById('signupRole').addEventListener('change', (e) => this.toggleDepartmentField(e.target.value));

        // Navigation
        document.querySelectorAll('.nav-links li[data-screen]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const screen = item.getAttribute('data-screen');
                this.showScreen(screen);
                
                // Update active nav item
                document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Product filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.filterProducts(btn.getAttribute('data-filter')));
        });

        // Add product button
        document.getElementById('addProductBtn')?.addEventListener('click', () => this.addProduct());
    }

    switchAuthTab(tab) {
        const loginTab = document.getElementById('loginTab');
        const signupTab = document.getElementById('signupTab');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (tab === 'login') {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        } else {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
    }

    toggleDepartmentField(role) {
        const departmentGroup = document.getElementById('departmentGroup');
        if (role === 'agent' || role === 'admin') {
            departmentGroup.classList.remove('hidden');
        } else {
            departmentGroup.classList.add('hidden');
        }
    }

    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageEl = document.getElementById('authMessage');

        this.showLoading(true);

        // Simulate API call delay
        setTimeout(() => {
            const user = this.storage.findUser(email, password);
            if (user) {
                this.storage.setCurrentUser(user);
                this.showDashboard(user);
                this.showMessage('Login successful!', 'success', messageEl);
            } else {
                this.showMessage('Invalid email or password', 'error', messageEl);
            }
            this.showLoading(false);
        }, 1000);
    }

    handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const role = document.getElementById('signupRole').value;
        const department = document.getElementById('signupDepartment').value;
        const messageEl = document.getElementById('authMessage');

        // Basic validation
        if (password.length < 8) {
            this.showMessage('Password must be at least 8 characters long', 'error', messageEl);
            return;
        }

        this.showLoading(true);

        // Simulate API call delay
        setTimeout(() => {
            const existingUsers = this.storage.getUsers();
            if (existingUsers.find(user => user.email === email)) {
                this.showMessage('Email already exists', 'error', messageEl);
                this.showLoading(false);
                return;
            }

            const user = {
                name,
                email,
                password,
                role,
                department: (role === 'agent' || role === 'admin') ? department : null,
                avatar: name.split(' ').map(n => n[0]).join('')
            };

            this.storage.saveUser(user);
            this.storage.setCurrentUser(user);
            this.showDashboard(user);
            this.showMessage('Account created successfully!', 'success', messageEl);
            this.showLoading(false);
        }, 1000);
    }

    handleLogout() {
        this.storage.clearCurrentUser();
        this.showAuthScreen();
        this.showMessage('Logged out successfully', 'success');
        
        // Clear forms
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
    }

    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // Show selected screen
        const screenElement = document.getElementById(screenName + 'Screen');
        if (screenElement) {
            screenElement.classList.remove('hidden');
            this.currentScreen = screenName;
            
            // Update screen title
            const title = document.getElementById('screenTitle');
            if (title) {
                title.textContent = this.formatScreenTitle(screenName);
            }

            // Load screen-specific data
            this.loadScreenData(screenName);
        }
    }

    formatScreenTitle(screenName) {
        const titles = {
            'dashboard': 'Dashboard',
            'productManagement': 'Product Management',
            'productPublisher': 'Product Publisher',
            'inventoryManager': 'Inventory Management',
            'customerManagement': 'Customer Management',
            'categoryManager': 'Category Management',
            'orderManager': 'Order Management',
            'analytics': 'Analytics & Reports',
            'activityLogs': 'Activity Logs'
        };
        return titles[screenName] || screenName;
    }

    loadScreenData(screenName) {
        switch (screenName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'productManagement':
                this.loadProductManagement();
                break;
            case 'productPublisher':
                this.loadProductPublisher();
                break;
            case 'inventoryManager':
                this.loadInventoryManager();
                break;
        }
    }

    loadDashboardData() {
        const products = this.storage.getProducts();
        
        // Calculate stats
        const totalProducts = products.length;
        const lowStockItems = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length;
        const outOfStockItems = products.filter(p => p.stock === 0).length;
        const pendingApprovals = products.filter(p => p.status === 'pending_approval').length;

        // Update stats cards
        this.updateStatCard('.stat-card.primary .stat-value', totalProducts);
        this.updateStatCard('.stat-card.warning .stat-value', lowStockItems);
        this.updateStatCard('.stat-card.danger .stat-value', pendingApprovals);

        // Update low stock table
        this.updateLowStockTable(products);
    }

    updateStatCard(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    }

    updateLowStockTable(products) {
        const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);
        const tbody = document.querySelector('#lowStockProducts tbody');
        
        if (tbody) {
            tbody.innerHTML = lowStockProducts.map(product => `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.sku}</td>
                    <td>${product.stock} units</td>
                    <td>
                        <span class="stock-badge ${product.stock === 0 ? 'stock-out' : 'stock-low'}">
                            ${product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadProductManagement() {
        const products = this.storage.getProducts();
        const productGrid = document.getElementById('productGrid');
        
        if (productGrid) {
            productGrid.innerHTML = products.map(product => `
                <div class="product-card" data-status="${product.status}">
                    <div class="product-image"><i class="fas fa-${this.getProductIcon(product.category)}"></i></div>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-meta">
                            <span class="product-status status-${product.status}">
                                ${this.formatStatus(product.status)}
                            </span>
                            <span style="color: var(--gray); font-size: 12px;">SKU: ${product.sku}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    getProductIcon(category) {
        const icons = {
            'electronics': 'laptop',
            'fashion': 'tshirt',
            'home': 'home',
            'sports': 'futbol'
        };
        return icons[category] || 'box';
    }

    formatStatus(status) {
        const statusMap = {
            'draft': 'Draft',
            'pending_approval': 'Pending',
            'approved': 'Approved',
            'published': 'Published',
            'rejected': 'Rejected'
        };
        return statusMap[status] || status;
    }

    filterProducts(filter) {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-status') === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    setupDragAndDrop() {
        const draggables = document.querySelectorAll('.draggable-product');
        const dropZones = document.querySelectorAll('.drop-zone');

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => {
                draggable.classList.add('dragging');
            });

            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', e => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                const draggable = document.querySelector('.dragging');
                if (draggable) {
                    const newStatus = zone.getAttribute('data-status');
                    
                    // In a real app, you would update the product status in the database
                    console.log(`Product moved to ${newStatus}`);
                    
                    zone.querySelector('.product-list').appendChild(draggable);
                }
            });
        });
    }

    loadProductPublisher() {
        const products = this.storage.getProducts();
        const statusContainers = {
            'draft': document.getElementById('draftProducts'),
            'pending_approval': document.getElementById('pendingProducts'),
            'approved': document.getElementById('approvedProducts'),
            'published': document.getElementById('publishedProducts')
        };

        // Clear existing products
        Object.values(statusContainers).forEach(container => {
            if (container) container.innerHTML = '';
        });

        // Add products to their respective status containers
        products.forEach(product => {
            const container = statusContainers[product.status];
            if (container) {
                const productElement = document.createElement('div');
                productElement.className = 'draggable-product';
                productElement.draggable = true;
                productElement.innerHTML = `
                    <strong>${product.name}</strong>
                    <div style="font-size: 12px; color: var(--gray); margin-top: 4px;">SKU: ${product.sku}</div>
                `;
                
                productElement.addEventListener('dragstart', () => {
                    productElement.classList.add('dragging');
                    productElement.setAttribute('data-product-id', product.id);
                });

                productElement.addEventListener('dragend', () => {
                    productElement.classList.remove('dragging');
                });

                container.appendChild(productElement);
            }
        });

        // Re-initialize drag and drop for new elements
        this.setupDragAndDrop();
    }

    loadInventoryManager() {
        const products = this.storage.getProducts();
        const tbody = document.getElementById('inventoryTableBody');
        
        if (tbody) {
            tbody.innerHTML = products.map(product => {
                let statusClass = 'stock-healthy';
                let statusText = 'Healthy';
                
                if (product.stock === 0) {
                    statusClass = 'stock-out';
                    statusText = 'Out of Stock';
                } else if (product.stock <= product.lowStockThreshold) {
                    statusClass = 'stock-low';
                    statusText = 'Low Stock';
                }

                return `
                    <tr>
                        <td><strong>${product.name}</strong></td>
                        <td>${product.sku}</td>
                        <td>${product.stock} units</td>
                        <td>${product.lowStockThreshold} units</td>
                        <td><span class="stock-badge ${statusClass}">${statusText}</span></td>
                        <td>
                            <button class="action-btn primary" onclick="app.editInventory(${product.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn success" onclick="app.restockInventory(${product.id})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    editInventory(productId) {
        // Implement edit inventory functionality
        console.log('Edit inventory for product:', productId);
        alert('Edit inventory feature would open a modal here');
    }

    restockInventory(productId) {
        // Implement restock functionality
        console.log('Restock inventory for product:', productId);
        alert('Restock feature would open a modal here');
    }

    addProduct() {
        // Implement add product functionality
        console.log('Add new product');
        alert('Add product feature would open a form here');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        const themeIcon = document.querySelector('#themeToggle i');
        
        document.documentElement.setAttribute('data-theme', newTheme);
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        // Save theme preference
        localStorage.setItem('ecommerce_theme', newTheme);
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.toggle('hidden', !show);
        }
    }

    showMessage(message, type, element = null) {
        const targetElement = element || document.getElementById('authMessage');
        if (targetElement) {
            targetElement.textContent = message;
            targetElement.style.color = type === 'success' ? 'var(--success)' : 'var(--danger)';
            targetElement.style.fontWeight = '600';
            
            // Auto-hide message after 3 seconds
            setTimeout(() => {
                targetElement.textContent = '';
            }, 3000);
        }
    }
}

// Load saved theme preference
const savedTheme = localStorage.getItem('ecommerce_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// Initialize the application when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EcommerceApp();
});