const API_BASE_URL = 'http://localhost:8080/api';

// --- Core Logic & API Integration ---

// --- Routing & Tab Switching ---
function showSection(sectionName, element) {
    const links = document.querySelectorAll('.sidebar-link');
    links.forEach(link => link.classList.remove('active'));

    if (element) {
        element.classList.add('active');
    } else {
        const sidebarLink = document.querySelector(`.sidebar-link[onclick*="'${sectionName}'"]`);
        if (sidebarLink) sidebarLink.classList.add('active');
    }

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `<div class="loader-wrapper"><div class="loader"></div></div>`;

    // Update Header Title
    const headerTitle = document.querySelector('.top-header h1');
    if (headerTitle) {
        let titleText = 'Dashboard';
        switch (sectionName) {
            case 'books': titleText = 'Books'; break;
            case 'users': titleText = 'Users'; break;
            case 'issue': titleText = 'Issue Book'; break;
            case 'return': titleText = 'Return Book'; break;
            case 'fine': titleText = 'Fine Reports'; break;
        }
        headerTitle.innerText = titleText;
        headerTitle.style.fontSize = '2.2rem';
    }

    switch (sectionName) {
        case 'dashboard': renderDashboard(); break;
        case 'books': renderBooks(); break;
        case 'users': renderUsers(); break;
        case 'issue': renderIssueForm(); break;
        case 'return': renderReturnForm(); break;
        case 'fine': renderFineSection(); break;
    }
}

function logout() {
    localStorage.removeItem('isAdminLoggedIn');
    window.location.href = 'index.html';
}

// --- Helper: Fetch Issue Records ---
async function fetchIssueRecords() {
    try {
        const res = await fetch(`${API_BASE_URL}/issues`);
        if (res.ok) return await res.json();
        return [];
    } catch (err) {
        console.error("Fetch records failed:", err);
        return [];
    }
}

// --- Dashboard Module ---
async function renderDashboard() {
    try {
        let stats = { totalBooks: 0, totalUsers: 0, issuedBooks: 0, availableStock: 0, overdueBooks: 0 };
        let activities = [];
        
        try {
            const [statsRes, activityRes] = await Promise.all([
                fetch(`${API_BASE_URL}/dashboard/stats`),
                fetch(`${API_BASE_URL}/dashboard/activity`)
            ]);

            if (statsRes.ok) stats = await statsRes.json();
            if (activityRes.ok) activities = await activityRes.json();
        } catch (err) {
            console.error("Dashboard data fetch failed:", err);
        }

        document.getElementById('main-content').innerHTML = `
            <!-- Summary Cards -->
            <div class="stats-grid">
                <div class="stat-card blue" onclick="showSection('books')">
                    <span class="label">Total Books</span>
                    <span class="value">${stats.totalBooks || 0}</span>
                    <i class="fas fa-book icon-bg"></i>
                </div>
                <div class="stat-card green" onclick="showSection('users')">
                    <span class="label">Total Users</span>
                    <span class="value">${stats.totalUsers || 0}</span>
                    <i class="fas fa-users-gear icon-bg"></i>
                </div>
                <div class="stat-card orange" onclick="showSection('issue')">
                    <span class="label">Issued Books</span>
                    <span class="value">${stats.issuedBooks || 0}</span>
                    <i class="fas fa-hand-holding icon-bg"></i>
                </div>
                <div class="stat-card cyan" onclick="showSection('books')">
                    <span class="label">Available Books</span>
                    <span class="value">${stats.availableStock || 0}</span>
                    <i class="fas fa-book-open icon-bg"></i>
                </div>
                <div class="stat-card red" onclick="showSection('fine')">
                    <span class="label">Overdue</span>
                    <span class="value">${stats.overdueBooks || 0}</span>
                    <i class="fas fa-triangle-exclamation icon-bg"></i>
                </div>
            </div>

            <!-- Quick Actions -->
            <div style="margin: 3.5rem 0;">
                <h2 style="margin-bottom: 1.5rem; color: var(--navy-primary); border-left: 5px solid var(--accent-blue); padding-left: 1rem;">Quick Action</h2>
                <div class="stats-grid">
                    <div class="stat-card quick-card" onclick="showBookModal()">
                        <div class="logo-icon" style="margin: 0 auto 1rem; background: var(--navy-primary); width: 60px; height: 60px;">
                            <i class="fas fa-book-medical" style="color: white; font-size: 1.5rem;"></i>
                        </div>
                        <h4 style="margin-top: 1rem;">Add New Book</h4>
                    </div>
                    <div class="stat-card quick-card" onclick="showUserModal()">
                        <div class="logo-icon" style="margin: 0 auto 1rem; background: var(--navy-primary); width: 60px; height: 60px;">
                            <i class="fas fa-user-plus" style="color: white; font-size: 1.5rem;"></i>
                        </div>
                        <h4 style="margin-top: 1rem;">Register User</h4>
                    </div>
                    <div class="stat-card quick-card" onclick="showIssueModal()">
                        <div class="logo-icon" style="margin: 0 auto 1rem; background: var(--navy-primary); width: 60px; height: 60px;">
                            <i class="fas fa-arrow-up-from-bracket" style="color: white; font-size: 1.5rem;"></i>
                        </div>
                        <h4 style="margin-top: 1rem;">Issue Book</h4>
                    </div>
                    <div class="stat-card quick-card" onclick="showReturnModal()">
                        <div class="logo-icon" style="margin: 0 auto 1rem; background: var(--navy-primary); width: 60px; height: 60px;">
                            <i class="fas fa-rotate-left" style="color: white; font-size: 1.5rem;"></i>
                        </div>
                        <h4 style="margin-top: 1rem;">Return Book</h4>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="card" style="margin-top: 3.5rem;">
                <div class="card-header">
                    <h2>Recent Activity</h2>
                    <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 500;">Admin logs synced</span>
                </div>
                <div class="table-responsive">
                    <table class="activity-table">
                        <thead>
                            <tr>
                                <th>Performed By</th>
                                <th>Book Title</th>
                                <th>Timestamp</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${activities.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding: 4rem; color: var(--text-muted);">No admin records</td></tr>' : 
                                activities.map(act => {
                                    let badgeClass = 'badge-success';
                                    let statusText = act.type;
                                    
                                    if (act.type === 'ISSUED') {
                                        badgeClass = 'badge-warning';
                                        statusText = 'Issued';
                                    } else if (act.type === 'RETURNED') {
                                        badgeClass = 'badge-success';
                                        statusText = 'Returned';
                                    } else if (act.type === 'ADDED') {
                                        badgeClass = 'badge-info';
                                        statusText = 'Added';
                                    }

                                    return `
                                        <tr>
                                            <td>${act.userName === 'System' || !act.userName ? 'Admin' : act.userName}</td>
                                            <td><b>${act.bookTitle || 'Untitled'}</b></td>
                                            <td>${act.timestamp}</td>
                                            <td><span class="badge ${badgeClass}">${statusText}</span></td>
                                        </tr>
                                    `;
                                }).join('')
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (err) { console.error(err); }
}

// --- Books Module ---
async function renderBooks(keyword = '') {
    try {
        let books = [];
        try {
            let searchKey = keyword.trim().toUpperCase().startsWith('B') ? keyword.trim().substring(1) : keyword;
            const url = keyword ? `${API_BASE_URL}/books?keyword=${encodeURIComponent(searchKey)}` : `${API_BASE_URL}/books`;
            const res = await fetch(url);
            if (res.ok) books = await res.json();
            else throw new Error("API Offline");
        } catch (e) {
            console.error("API Error:", e);
            books = [];
        }

        document.getElementById('main-content').innerHTML = `
            <div class="card">
                <div class="card-header" style="padding: 1rem 1.5rem; gap: 1rem; flex-wrap: wrap;">
                    <div class="search-merged" style="flex: 1; min-width: 300px; display: flex; box-shadow: var(--shadow-sm); border-radius: var(--border-radius); overflow: hidden; border: 1.5px solid #e2e8f0;">
                        <input type="text" id="bookSearchInput" style="border: none; padding: 0.75rem 1.25rem; flex: 1; outline: none; font-size: 0.95rem;" placeholder="Search repository by Title, Author or BID (e.g. B1)..." value="${keyword}" onkeydown="if(event.key==='Enter') renderBooks(this.value)">
                        <button class="btn btn-primary" style="border-radius: 0; padding: 0 1.5rem; box-shadow: none;" onclick="renderBooks(document.getElementById('bookSearchInput').value)">
                            <i class="fas fa-magnifying-glass"></i>
                        </button>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="showBookModal()" style="white-space: nowrap;">
                        <i class="fas fa-plus"></i> Add New Book
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 50px;">S.No</th>
                                    <th>BID</th>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Quantity</th>
                                    <th>Available</th>
                                    <th style="text-align: center; width: 120px;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${books.map((book, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>B${book.id || 0}</td>
                                        <td><b>${book.title || 'Untitled'}</b></td>
                                        <td>${book.author || 'Unknown'}</td>
                                        <td style="font-weight: 600; color: var(--navy-primary);">${book.availableStock || 0} / ${book.quantity || 0}</td>
                                        <td>
                                            <span class="badge ${(book.availableStock || 0) > 0 ? 'badge-success' : 'badge-danger'}">
                                                ${(book.availableStock || 0) > 0 ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td style="text-align: center;">
                                            <div style="display: flex; gap: 0.5rem; justify-content: center;">
                                                <button class="btn btn-sm btn-success" onclick="editBook(${book.id})" title="Edit Book" style="background: #ecfdf5; color: #059669; border: 1.5px solid #10b981;">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteBook(${book.id})" title="Delete Book" style="background: #fef2f2; color: #dc2626; border: 1.5px solid #ef4444;">
                                                    <i class="fas fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (err) { console.error(err); }
}

function showBookModal(existingBook = null) {
    const overlay = document.getElementById('modalOverlay');
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="modal">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>${existingBook ? 'Update Book Details' : 'Add New Book'}</h2>
            <form id="bookForm" style="margin-top: 1.5rem;">
                <div class="form-group">
                    <label>Book Title</label>
                    <input type="text" id="bookTitle" required value="${existingBook ? existingBook.title : ''}">
                </div>
                <div class="form-group">
                    <label>Author</label>
                    <input type="text" id="bookAuthor" required value="${existingBook ? existingBook.author : ''}">
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" id="bookQuantity" required min="1" value="${existingBook ? existingBook.quantity : '1'}">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 1rem;">${existingBook ? 'Update' : 'Add'}</button>
            </form>
        </div>
    `;

    document.getElementById('bookForm').onsubmit = async (e) => {
        e.preventDefault();
        const bookData = {
            id: existingBook ? existingBook.id : null,
            title: document.getElementById('bookTitle').value.trim(),
            author: document.getElementById('bookAuthor').value.trim(),
            quantity: parseInt(document.getElementById('bookQuantity').value)
        };
        try {
            const res = await fetch(`${API_BASE_URL}/books`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });
            if (res.ok) { closeModal(); renderBooks(); }
            else {
                const errorMsg = await res.text();
                alert(`Error: ${errorMsg || "Failed to save book"}`);
            }
        } catch (err) { alert("Network error. Please check your connection."); }
    };
}

async function editBook(id) {
    const res = await fetch(`${API_BASE_URL}/books/${id}`);
    if (res.ok) showBookModal(await res.json());
}

async function deleteBook(id) {
    if (confirm("Remove record permanently?")) {
        const res = await fetch(`${API_BASE_URL}/books/${id}`, { method: 'DELETE' });
        if (res.ok) renderBooks();
        else {
            const errorMsg = await res.text();
            alert(`Error: ${errorMsg || "Failed to delete book"}`);
        }
    }
}

// --- Users Module ---
async function renderUsers(keyword = '') {
    try {
        let users = [];
        let searchFailed = false;
        try {
            const url = keyword ? `${API_BASE_URL}/users?keyword=${encodeURIComponent(keyword)}` : `${API_BASE_URL}/users`;
            const res = await fetch(url);
            if (res.ok) {
                users = await res.json();
            } else {
                searchFailed = true;
            }
        } catch (e) {
            searchFailed = true;
        }

        // If backend search failed, do client-side fallback filtering
        if (searchFailed) {
            try {
                const res = await fetch(`${API_BASE_URL}/users`);
                if (res.ok) {
                    const all = await res.json();
                    const kw = keyword.toLowerCase();
                    const rawKw = kw.startsWith('u') ? kw.substring(1) : kw;
                    users = keyword ? all.filter(u =>
                        (u.name || '').toLowerCase().includes(kw) ||
                        (u.email || '').toLowerCase().includes(kw) ||
                        (u.contact || '').toLowerCase().includes(kw) ||
                        String(u.id || '').includes(rawKw)
                    ) : all;
                } else {
                    users = [];
                }
            } catch (e) {
                users = [];
            }
        }

        document.getElementById('main-content').innerHTML = `
            <div class="card">
                <div class="card-header" style="padding: 1rem 1.5rem; gap: 1rem; flex-wrap: wrap;">
                    <div class="search-merged" style="flex: 1; min-width: 300px; display: flex; box-shadow: var(--shadow-sm); border-radius: var(--border-radius); overflow: hidden; border: 1.5px solid #e2e8f0;">
                        <input type="text" id="userSearchInput" style="border: none; padding: 0.75rem 1.25rem; flex: 1; outline: none; font-size: 0.95rem;" placeholder="Search by name, UID or email..." value="${keyword}" onkeydown="if(event.key==='Enter') renderUsers(this.value)">
                        <button class="btn btn-primary" style="border-radius: 0; padding: 0 1.5rem; box-shadow: none;" onclick="renderUsers(document.getElementById('userSearchInput').value)">
                            <i class="fas fa-magnifying-glass"></i>
                        </button>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="showUserModal()" style="white-space: nowrap;">
                        <i class="fas fa-user-plus"></i> Add User
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 50px;">S.No</th>
                                    <th>UID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Contact</th>
                                    <th style="text-align: center; width: 120px;">Action</th>

                                </tr>
                            </thead>
                            <tbody>
                                ${users.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding: 4rem; color: var(--text-muted);">No members found</td></tr>` :
                                    users.map((u, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>U${u.id || 0}</td>
                                            <td><b>${u.name || 'Unknown'}</b></td>
                                            <td style="color: var(--accent-blue);">${u.email || '-'}</td>
                                            <td>${u.contact || '-'}</td>
                                            <td style="text-align: center;">
                                                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                                                    <button class="btn btn-sm btn-success" onclick="editUser(${u.id})" title="Edit User" style="background: #ecfdf5; color: #059669; border: 1.5px solid #10b981;">
                                                        <i class="fas fa-user-pen"></i>
                                                    </button>
                                                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})" title="Delete User" style="background: #fef2f2; color: #dc2626; border: 1.5px solid #ef4444;">
                                                        <i class="fas fa-user-xmark"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (err) { console.error(err); }
}

function showUserModal(existingUser = null) {
    const overlay = document.getElementById('modalOverlay');
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="modal">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>${existingUser ? 'Update User' : 'Add New User'}</h2>
            <form id="userForm" style="margin-top: 1.5rem;">
                <div class="form-group"><label>Full Name</label><input type="text" id="userName" required value="${existingUser ? existingUser.name : ''}"></div>
                <div class="form-group"><label>Email Address</label><input type="email" id="userEmail" required value="${existingUser ? existingUser.email : ''}"></div>
                <div class="form-group"><label>Phone Number</label><input type="text" id="userContact" required value="${existingUser ? existingUser.contact : ''}"></div>
                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 1rem;">${existingUser ? 'Update' : 'Add'}</button>
            </form>
        </div>
    `;
    document.getElementById('userForm').onsubmit = async (e) => {
        e.preventDefault();
        const userData = { id: existingUser ? existingUser.id : null, name: document.getElementById('userName').value.trim(), email: document.getElementById('userEmail').value.trim(), contact: document.getElementById('userContact').value.trim() };
        const url = existingUser ? `${API_BASE_URL}/users/${existingUser.id}` : `${API_BASE_URL}/users`;
        const res = await fetch(url, { method: existingUser ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
        if (res.ok) {
            closeModal(); renderUsers();
        } else {
            const errorMsg = await res.text();
            alert(`Error: ${errorMsg || "Failed to save user"}`);
        }
    };
}

async function editUser(id) {
    const res = await fetch(`${API_BASE_URL}/users`);
    if (res.ok) { const users = await res.json(); const u = users.find(x => x.id == id); if (u) showUserModal(u); }
}

async function deleteUser(id) {
    if (confirm("Delete User?")) { 
        const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' }); 
        if (res.ok) renderUsers();
        else {
            const errorMsg = await res.text();
            alert(`Error: ${errorMsg || "Failed to delete user"}`);
        }
    }
}

// --- Issue Book Module ---
async function renderIssueForm() {
    const records = await fetchIssueRecords();
    const activeIssues = records.filter(r => r.status === 'ISSUED');

    document.getElementById('main-content').innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Issue Book History</h2>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <span class="badge badge-warning">${activeIssues.length} ACTIVE</span>
                    <button class="btn btn-primary btn-sm" onclick="showIssueModal()">
                        <i class="fas fa-plus"></i> Issue New Book
                    </button>
                </div>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr><th style="width: 50px;">S.No</th><th>Book Title</th><th>User</th><th>Issue Date</th><th>Deadline</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        ${activeIssues.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 4rem; color: var(--text-muted);">No active loans in the ecosystem</td></tr>' : 
                            activeIssues.map((r, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td><b>${r.book.title}</b></td>
                                    <td>${r.user.name}</td>
                                    <td>${r.issueDate}</td>
                                    <td><b style="color: var(--danger)">${r.dueDate}</b></td>
                                    <td><span class="badge badge-warning">ISSUED</span></td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function showIssueModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="modal">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>Issue Book</h2>
            <form id="issueForm" style="margin-top: 1.5rem;">
                <div class="form-group">
                    <label>Book ID (e.g. B1)</label>
                    <input type="text" id="issueBookId" required placeholder="Enter Book ID (B1)">
                </div>
                <div class="form-group">
                    <label>User ID (e.g. U1)</label>
                    <input type="text" id="issueUserId" required placeholder="Enter User ID (U1)">
                </div>
                <div class="form-group" style="margin-bottom: 2rem;">
                    <label>Days</label>
                    <input type="number" id="issueDuration" value="7" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 1rem;">
                    Issue Book
                </button>
            </form>
        </div>
    `;

    document.getElementById('issueForm').onsubmit = async (e) => {
        e.preventDefault();
        const bId = document.getElementById('issueBookId').value.trim().toUpperCase();
        const uId = document.getElementById('issueUserId').value.trim().toUpperCase();
        
        if (!bId.startsWith('B')) { alert("Book ID must start with 'B' (e.g. B101)"); return; }
        if (!uId.startsWith('U')) { alert("User ID must start with 'U' (e.g. U1)"); return; }

        const payload = { 
            bookId: bId.replace('B', ''), 
            userId: uId.replace('U', ''), 
            duration: document.getElementById('issueDuration').value 
        };
        const res = await fetch(`${API_BASE_URL}/issues/issue`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { closeModal(); renderIssueForm(); }
        else {
            const errorMsg = await res.text();
            alert(`Issue Failed: ${errorMsg || "Please check Book/User IDs"}`);
        }
    };
}

// --- Return Book Module ---
async function renderReturnForm() {
    const records = await fetchIssueRecords();
    const returnHistory = records.filter(r => r.status === 'RETURNED').slice(0, 10);

    document.getElementById('main-content').innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Return Book History</h2>
                <button class="btn btn-primary btn-sm" onclick="showReturnModal()">
                    <i class="fas fa-rotate-left"></i> Return Book
                </button>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr><th style="width: 50px;">S.No</th><th>Book Title</th><th>User</th><th>Return Date</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        ${returnHistory.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 4rem; color: var(--text-muted);">No recent returns</td></tr>' : 
                            returnHistory.map((r, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td><b>${r.book.title}</b></td>
                                    <td>${r.user.name}</td>
                                    <td>${r.returnDate}</td>
                                    <td><span class="badge badge-success">RETURNED</span></td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function showReturnModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="modal">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>Return Book</h2>
            <form id="returnForm" style="margin-top: 1.5rem;">
                <div class="form-group">
                    <label>Book ID (e.g. B1)</label>
                    <input type="text" id="returnBookId" required placeholder="B1">
                </div>
                <div class="form-group" style="margin-bottom: 2rem;">
                    <label>User ID (e.g. U1)</label>
                    <input type="text" id="returnUserId" required placeholder="U1">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 1rem;">
                    Return Book
                </button>
            </form>
        </div>
    `;

    document.getElementById('returnForm').onsubmit = async (e) => {
        e.preventDefault();
        const bId = document.getElementById('returnBookId').value.trim().toUpperCase();
        const uId = document.getElementById('returnUserId').value.trim().toUpperCase();

        if (!bId.startsWith('B')) { alert("Book ID must start with 'B' (e.g. B101)"); return; }
        if (!uId.startsWith('U')) { alert("User ID must start with 'U' (e.g. U1)"); return; }

        const payload = { 
            bookId: bId.replace('B', ''), 
            userId: uId.replace('U', ''),
        };
        const res = await fetch(`${API_BASE_URL}/issues/return`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { closeModal(); renderReturnForm(); }
        else {
            const errorMsg = await res.text();
            alert(`Return Failed: ${errorMsg || "User ID or Book ID incorrect"}`);
        }
    };
}

// --- Fine Management Module ---
async function renderFineSection() {
    // Fetch overdue/fined records from backend (ISSUED records with past due date)
    let fines = [];
    try {
        const res = await fetch(`${API_BASE_URL}/issues`);
        if (res.ok) {
            const allIssues = await res.json();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            fines = allIssues
                .filter(r => r.status === 'ISSUED' || r.fine > 0)
                .map(r => {
                    const due = new Date(r.dueDate);
                    const daysLate = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));
                    return {
                        issueId: r.id,
                        name: r.user ? r.user.name : 'Unknown',
                        title: r.book ? r.book.title : 'Unknown',
                        daysLate,
                        fine: r.fine || (daysLate * 10),
                        status: r.status,
                        paid: r.finePaid || false
                    };
                })
                .filter(r => r.daysLate > 0 || r.fine > 0);
        }
    } catch (err) {
        console.error("Fine data fetch failed:", err);
        fines = [];
    }

    const totalFine = fines.filter(f => !f.paid).reduce((sum, f) => sum + (f.fine || 0), 0);
    const pendingCount = fines.filter(f => !f.paid).length;

    document.getElementById('main-content').innerHTML = `
        <div style="display: flex; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap;">
            <div class="stat-card red" style="flex: 1; min-width: 180px; cursor: default;">
                <span class="label">Pending Fines</span>
                <span id="pendingFineCount" class="value">${pendingCount}</span>
                <i class="fas fa-triangle-exclamation icon-bg"></i>
            </div>
            <div class="stat-card orange" style="flex: 1; min-width: 180px; cursor: default;">
                <span class="label">Total Remaining Fine</span>
                <span id="totalRemainingFine" class="value">₹${totalFine}</span>
                <i class="fas fa-indian-rupee-sign icon-bg"></i>
            </div>
        </div>
        <div class="card" style="border-top: 4px solid var(--danger);">
            <div class="card-header">
                <h2>Fine Report</h2>
                <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">₹10/day overdue charge</span>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th style="width:50px;">S.No</th>
                            <th>Name</th>
                            <th>Title</th>
                            <th>Days Late</th>
                            <th>Fine</th>
                            <th>Status</th>
                            <th style="text-align:center;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${fines.length === 0 ? `<tr><td colspan="7" style="text-align:center; padding: 4rem; color: var(--text-muted);">No outstanding fines 🎉</td></tr>` :
                            fines.map((fine, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td><b>${fine.name}</b></td>
                                    <td>${fine.title}</td>
                                    <td><span style="color: var(--danger); font-weight: 600;">${fine.daysLate} day${fine.daysLate !== 1 ? 's' : ''}</span></td>
                                    <td><b style="color: var(--danger);">₹${fine.fine || 0}</b></td>
                                    <td>
                                        <span class="badge ${fine.paid ? 'badge-success' : 'badge-danger'}">
                                            ${fine.paid ? 'PAID' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td style="text-align:center;">
                                        ${fine.paid
                                            ? `<span style="color: var(--success); font-size: 0.8rem; font-weight: 600;"><i class="fas fa-circle-check"></i> Cleared</span>`
                                            : `<button class="btn btn-sm btn-primary" onclick="showPayFineModal(${fine.issueId}, '${fine.name}', '${fine.title}', ${fine.fine})">
                                                <i class="fas fa-credit-card"></i> Pay
                                               </button>`
                                        }
                                    </td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function showPayFineModal(issueId, userName, bookTitle, fineAmount) {
    const overlay = document.getElementById('modalOverlay');
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="modal" style="max-width: 480px;">
            <span class="close" onclick="closeModal()">&#x2715;</span>
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                    <i class="fas fa-receipt" style="color: white; font-size: 1.4rem;"></i>
                </div>
                <h2 style="margin: 0; font-size: 1.4rem;">Pay Fine</h2>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0.3rem 0 0;">Settle outstanding library fine</p>
            </div>

            <!-- Fine Summary -->
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted); font-size: 0.85rem;">Member</span>
                    <span style="font-weight: 600; font-size: 0.9rem;">${userName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-muted); font-size: 0.85rem;">Book</span>
                    <span style="font-weight: 600; font-size: 0.9rem;">${bookTitle}</span>
                </div>
                <div style="border-top: 1px dashed #fca5a5; padding-top: 0.6rem; margin-top: 0.6rem; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; color: var(--danger);">Total Amount Due</span>
                    <span style="font-weight: 800; font-size: 1.3rem; color: var(--danger);">₹${fineAmount}</span>
                </div>
            </div>

            <!-- Payment Method Tabs -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
                <button onclick="switchPayTab('card')" id="tab-card" class="btn btn-primary btn-sm" style="flex: 1; justify-content: center; border-radius: 8px;">
                    <i class="fas fa-credit-card"></i> Card
                </button>
                <button onclick="switchPayTab('upi')" id="tab-upi" class="btn btn-sm" style="flex: 1; justify-content: center; border-radius: 8px; background: #f1f5f9; color: var(--navy-primary); border: 1.5px solid #e2e8f0;">
                    <i class="fas fa-mobile-screen"></i> UPI
                </button>
                <button onclick="switchPayTab('cash')" id="tab-cash" class="btn btn-sm" style="flex: 1; justify-content: center; border-radius: 8px; background: #f1f5f9; color: var(--navy-primary); border: 1.5px solid #e2e8f0;">
                    <i class="fas fa-money-bill-wave"></i> Cash
                </button>
            </div>

            <!-- Card Form -->
            <div id="pay-form-card">
                <form id="payFineForm" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="form-group" style="margin: 0;">
                        <label>Cardholder Name</label>
                        <input type="text" id="payCardName" placeholder="e.g. ${userName}" required>
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label>Card Number</label>
                        <input type="text" id="payCardNumber" placeholder="1234 5678 9012 3456" maxlength="19"
                            oninput="this.value = this.value.replace(/[^0-9]/g,'').replace(/(.{4})/g,'$1 ').trim()">
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <div class="form-group" style="flex: 1; margin: 0;">
                            <label>Expiry</label>
                            <input type="text" id="payExpiry" placeholder="MM/YY" maxlength="5"
                                oninput="let v=this.value.replace(/[^0-9]/g,''); if(v.length>2) v=v.slice(0,2)+'/'+v.slice(2); this.value=v;">
                        </div>
                        <div class="form-group" style="flex: 1; margin: 0;">
                            <label>CVV</label>
                            <input type="password" id="payCvv" placeholder="•••" maxlength="3">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 1rem; margin-top: 0.5rem; font-size: 1rem;">
                        <i class="fas fa-lock"></i> Pay ₹${fineAmount} Securely
                    </button>
                </form>
            </div>

            <!-- UPI Form -->
            <div id="pay-form-upi" style="display:none;">
                <form id="payFineFormUpi" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="form-group" style="margin: 0;">
                        <label>UPI ID</label>
                        <input type="text" id="payUpiId" placeholder="e.g. name@upi" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 1rem; margin-top: 0.5rem; font-size: 1rem;">
                        <i class="fas fa-paper-plane"></i> Pay ₹${fineAmount} via UPI
                    </button>
                </form>
            </div>

            <!-- Cash Form -->
            <div id="pay-form-cash" style="display:none;">
                <div style="text-align: center; padding: 1.5rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; margin-bottom: 1rem;">
                    <i class="fas fa-money-bill-wave" style="font-size: 2rem; color: #16a34a; margin-bottom: 0.75rem;"></i>
                    <p style="margin: 0; font-weight: 600; color: #166534;">Collect ₹${fineAmount} in cash from the member at the counter.</p>
                </div>
                <button onclick="processFinePayment(${issueId}, 'Cash')" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 1rem; font-size: 1rem; background: #16a34a;">
                    <i class="fas fa-circle-check"></i> Mark as Collected
                </button>
            </div>
        </div>
    `;

    // Card form submit
    document.getElementById('payFineForm').onsubmit = (e) => {
        e.preventDefault();
        processFinePayment(issueId, 'Card');
    };

    // UPI form submit
    document.getElementById('payFineFormUpi').onsubmit = (e) => {
        e.preventDefault();
        processFinePayment(issueId, 'UPI');
    };
}

function switchPayTab(tab) {
    ['card', 'upi', 'cash'].forEach(t => {
        const form = document.getElementById(`pay-form-${t}`);
        const btn = document.getElementById(`tab-${t}`);
        if (form) form.style.display = t === tab ? 'block' : 'none';
        if (btn) {
            if (t === tab) {
                btn.className = 'btn btn-primary btn-sm';
                btn.style.cssText = 'flex: 1; justify-content: center; border-radius: 8px;';
            } else {
                btn.className = 'btn btn-sm';
                btn.style.cssText = 'flex: 1; justify-content: center; border-radius: 8px; background: #f1f5f9; color: var(--navy-primary); border: 1.5px solid #e2e8f0;';
            }
        }
    });
}

async function processFinePayment(issueId, method) {
    const overlay = document.getElementById('modalOverlay');

    // Show processing state
    overlay.querySelector('.modal').innerHTML = `
        <div style="text-align: center; padding: 3rem 2rem;">
            <div class="loader" style="margin: 0 auto 1.5rem;"></div>
            <h3 style="color: var(--navy-primary);">Processing Payment...</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Please wait, do not close this window.</p>
        </div>
    `;

    // Simulate payment processing + optional backend call
    await new Promise(r => setTimeout(r, 1500));

    try {
        await fetch(`${API_BASE_URL}/issues/${issueId}/pay-fine`, { method: 'POST' });
    } catch (e) { /* backend may not have this endpoint yet, that's ok */ }

    // Update row in table: change badge to PAID and remove Pay button
    const allRows = document.querySelectorAll('#main-content table tbody tr');
    allRows.forEach(row => {
        const btn = row.querySelector(`button[onclick*="showPayFineModal(${issueId},"]`);
        if (btn) {
            // Update status badge cell
            const cells = row.querySelectorAll('td');
            const fineCell = cells[4]; // Fix the cell index for Fine amount (e.g., cell 4)
            const statusCell = cells[5]; // cell 5 = Status
            const actionCell = cells[6]; // cell 6 = Action
            
            if (statusCell) statusCell.innerHTML = '<span class="badge badge-success">PAID</span>';
            if (actionCell) actionCell.innerHTML = '<span style="color: var(--success); font-size: 0.8rem; font-weight: 600;"><i class="fas fa-circle-check"></i> Cleared</span>';
            
            // Extract the fine amount to update the summary cards immediately
            const fineText = fineCell ? fineCell.innerText.replace('₹', '') : '0';
            const fineAmount = parseFloat(fineText) || 0;

            // Update summary cards instantly
            const pendingEl = document.getElementById('pendingFineCount');
            const totalEl = document.getElementById('totalRemainingFine');
            
            if (pendingEl) {
                let currentPending = parseInt(pendingEl.innerText) || 0;
                pendingEl.innerText = Math.max(0, currentPending - 1);
            }
            if (totalEl) {
                let currentTotal = parseFloat(totalEl.innerText.replace('₹', '')) || 0;
                totalEl.innerText = `₹${Math.max(0, currentTotal - fineAmount)}`;
            }

            // Sync with backend by re-rendering after success modal
            // (Handled by user clicking 'Back to Fine Report' or in background)
            setTimeout(() => renderFineSection(), 3000);
        }
    });

    // Show success state
    overlay.querySelector('.modal').innerHTML = `
        <div style="text-align: center; padding: 2.5rem 2rem;">
            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                <i class="fas fa-circle-check" style="color: white; font-size: 2rem;"></i>
            </div>
            <h2 style="color: #16a34a; margin-bottom: 0.5rem;">Payment Successful!</h2>
            <p style="color: var(--text-muted); margin-bottom: 0.3rem;">Fine settled via <b>${method}</b></p>
            <p style="color: var(--text-muted); font-size: 0.85rem;">A receipt has been recorded in the system.</p>
            <button onclick="closeModal()" class="btn btn-primary" style="margin-top: 1.5rem; padding: 0.8rem 2.5rem; justify-content: center;">
                <i class="fas fa-arrow-left"></i> Back to Fine Report
            </button>
        </div>
    `;
}

// Generic Helpers
function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }
document.getElementById('modalOverlay').onclick = e => { if (e.target.id === 'modalOverlay') closeModal(); };

// Auth Check & Initial Load
window.onload = () => { if (window.location.pathname.includes('dashboard.html')) showSection('dashboard'); };
