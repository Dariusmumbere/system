// Data Structure
let members = JSON.parse(localStorage.getItem('members')) || [];
let savings = JSON.parse(localStorage.getItem('savings')) || [];
let loans = JSON.parse(localStorage.getItem('loans')) || [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM Elements
const sections = document.querySelectorAll('.content-section');
const navLinks = document.querySelectorAll('nav ul li a');
const memberForm = document.getElementById('member-form');
const savingForm = document.getElementById('saving-form');
const loanForm = document.getElementById('loan-form');
const repaymentForm = document.getElementById('repayment-form');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmOkBtn = document.getElementById('confirm-ok');
const confirmCancelBtn = document.getElementById('confirm-cancel');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    loadMembers();
    loadSavings();
    loadLoans();
    loadTransactions();
    setupEventListeners();
    updateMemberSelects();
});

// Event Listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Member Form
    memberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveMember();
    });

    // Saving Form
    savingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSaving();
    });

    // Loan Form
    loanForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveLoan();
    });

    // Repayment Form
    repaymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveRepayment();
    });

    // Add Member Button
    document.getElementById('add-member-btn').addEventListener('click', function() {
        showMemberModal();
    });

    // Add Saving Button
    document.getElementById('add-saving-btn').addEventListener('click', function() {
        showSavingModal();
    });

    // Add Loan Button
    document.getElementById('add-loan-btn').addEventListener('click', function() {
        showLoanModal();
    });

    // Member Search
    document.getElementById('member-search').addEventListener('input', function() {
        filterMembers(this.value);
    });

    // Saving Filters
    document.getElementById('saving-member-filter').addEventListener('change', function() {
        filterSavings();
    });
    document.getElementById('saving-type-filter').addEventListener('change', function() {
        filterSavings();
    });
    document.getElementById('saving-date-filter').addEventListener('change', function() {
        filterSavings();
    });

    // Loan Filters
    document.getElementById('loan-member-filter').addEventListener('change', function() {
        filterLoans();
    });
    document.getElementById('loan-status-filter').addEventListener('change', function() {
        filterLoans();
    });

    // Transaction Filters
    document.getElementById('transaction-type-filter').addEventListener('change', function() {
        filterTransactions();
    });
    document.getElementById('transaction-date-filter').addEventListener('change', function() {
        filterTransactions();
    });

    // Report Cards
    document.getElementById('savings-report').addEventListener('click', function() {
        generateSavingsReport();
    });
    document.getElementById('loans-report').addEventListener('click', function() {
        generateLoansReport();
    });
    document.getElementById('members-report').addEventListener('click', function() {
        generateMembersReport();
    });

    // Confirmation Modal
    confirmCancelBtn.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });
}

// Section Navigation
function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
            
            // Refresh section data when shown
            switch(sectionId) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'members':
                    loadMembers();
                    break;
                case 'savings':
                    loadSavings();
                    break;
                case 'loans':
                    loadLoans();
                    break;
                case 'transactions':
                    loadTransactions();
                    break;
            }
        }
    });
}

// Dashboard Functions
function loadDashboard() {
    // Total Members
    document.getElementById('total-members').textContent = members.length;
    
    // Total Savings
    const totalSavings = savings.reduce((sum, saving) => {
        if (saving.type === 'deposit') return sum + saving.amount;
        if (saving.type === 'withdrawal') return sum - saving.amount;
        return sum;
    }, 0);
    document.getElementById('total-savings').textContent = formatCurrency(totalSavings);
    
    // Active Loans
    const activeLoans = loans.filter(loan => loan.status === 'active').length;
    document.getElementById('active-loans').textContent = activeLoans;
    
    // Loan Balance
    const loanBalance = loans.reduce((sum, loan) => {
        if (loan.status === 'active') return sum + (loan.amount - (loan.paid || 0));
        return sum;
    }, 0);
    document.getElementById('loan-balance').textContent = formatCurrency(loanBalance);
    
    // Recent Transactions
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    const tbody = document.querySelector('#recent-transactions tbody');
    tbody.innerHTML = '';
    
    recentTransactions.forEach(transaction => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${getMemberName(transaction.memberId)}</td>
            <td>${transaction.type}</td>
            <td>${formatCurrency(transaction.amount)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Member Functions
function loadMembers() {
    const tbody = document.querySelector('#members-table tbody');
    tbody.innerHTML = '';
    
    members.forEach(member => {
        const savingsBalance = getMemberSavingsBalance(member.id);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.phone}</td>
            <td>${formatDate(member.joinDate)}</td>
            <td>${formatCurrency(savingsBalance)}</td>
            <td><span class="status active">Active</span></td>
            <td>
                <button class="btn btn-primary btn-sm edit-member" data-id="${member.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm delete-member" data-id="${member.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-member').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            editMember(memberId);
        });
    });
    
    document.querySelectorAll('.delete-member').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            confirmAction(
                'Delete Member',
                'Are you sure you want to delete this member? This action cannot be undone.',
                () => deleteMember(memberId)
            );
        });
    });
}

function filterMembers(searchTerm) {
    const rows = document.querySelectorAll('#members-table tbody tr');
    searchTerm = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const phone = row.cells[2].textContent.toLowerCase();
        
        if (name.includes(searchTerm) || phone.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function showMemberModal(member = null) {
    const modal = document.getElementById('member-modal');
    const title = document.getElementById('member-modal-title');
    const form = document.getElementById('member-form');
    
    if (member) {
        title.textContent = 'Edit Member';
        document.getElementById('member-id').value = member.id;
        document.getElementById('member-name').value = member.name;
        document.getElementById('member-phone').value = member.phone;
        document.getElementById('member-email').value = member.email || '';
        document.getElementById('member-address').value = member.address || '';
        document.getElementById('member-id-number').value = member.idNumber || '';
        document.getElementById('member-join-date').value = member.joinDate;
    } else {
        title.textContent = 'Add New Member';
        form.reset();
        document.getElementById('member-join-date').value = new Date().toISOString().split('T')[0];
    }
    
    modal.style.display = 'flex';
    
    // Close modal when clicking on X
    modal.querySelector('.close').addEventListener('click', function() {
        modal.style.display = 'none';
    });
}

function saveMember() {
    const id = document.getElementById('member-id').value;
    const name = document.getElementById('member-name').value;
    const phone = document.getElementById('member-phone').value;
    const email = document.getElementById('member-email').value;
    const address = document.getElementById('member-address').value;
    const idNumber = document.getElementById('member-id-number').value;
    const joinDate = document.getElementById('member-join-date').value;
    
    const memberData = {
        name,
        phone,
        email,
        address,
        idNumber,
        joinDate
    };
    
    if (id) {
        // Update existing member
        const index = members.findIndex(m => m.id === id);
        if (index !== -1) {
            members[index] = { ...members[index], ...memberData };
        }
    } else {
        // Add new member
        memberData.id = generateId();
        members.push(memberData);
    }
    
    saveData();
    document.getElementById('member-modal').style.display = 'none';
    loadMembers();
    loadDashboard();
    updateMemberSelects();
}

function editMember(id) {
    const member = members.find(m => m.id === id);
    if (member) {
        showMemberModal(member);
    }
}

function deleteMember(id) {
    members = members.filter(m => m.id !== id);
    savings = savings.filter(s => s.memberId !== id);
    loans = loans.filter(l => l.memberId !== id);
    transactions = transactions.filter(t => t.memberId !== id);
    
    saveData();
    loadMembers();
    loadSavings();
    loadLoans();
    loadTransactions();
    loadDashboard();
    updateMemberSelects();
}

// Savings Functions
function loadSavings() {
    const tbody = document.querySelector('#savings-table tbody');
    tbody.innerHTML = '';
    
    savings.forEach(saving => {
        const member = members.find(m => m.id === saving.memberId);
        const memberName = member ? member.name : 'Unknown';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(saving.date)}</td>
            <td>${memberName}</td>
            <td>${saving.type.charAt(0).toUpperCase() + saving.type.slice(1)}</td>
            <td>${formatCurrency(saving.amount)}</td>
            <td>${formatCurrency(getMemberSavingsBalanceAtDate(saving.memberId, saving.date))}</td>
            <td>${saving.notes || ''}</td>
            <td>
                <button class="btn btn-primary btn-sm edit-saving" data-id="${saving.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm delete-saving" data-id="${saving.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-saving').forEach(btn => {
        btn.addEventListener('click', function() {
            const savingId = this.getAttribute('data-id');
            editSaving(savingId);
        });
    });
    
    document.querySelectorAll('.delete-saving').forEach(btn => {
        btn.addEventListener('click', function() {
            const savingId = this.getAttribute('data-id');
            confirmAction(
                'Delete Transaction',
                'Are you sure you want to delete this savings transaction?',
                () => deleteSaving(savingId)
            );
        });
    });
}

function filterSavings() {
    const memberFilter = document.getElementById('saving-member-filter').value;
    const typeFilter = document.getElementById('saving-type-filter').value;
    const dateFilter = document.getElementById('saving-date-filter').value;
    
    const rows = document.querySelectorAll('#savings-table tbody tr');
    
    rows.forEach(row => {
        const memberId = row.cells[1].textContent;
        const type = row.cells[2].textContent.toLowerCase();
        const date = row.cells[0].textContent;
        
        const memberMatch = !memberFilter || memberId === memberFilter;
        const typeMatch = !typeFilter || type === typeFilter;
        const dateMatch = !dateFilter || date === formatDate(dateFilter);
        
        if (memberMatch && typeMatch && dateMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function showSavingModal(saving = null) {
    const modal = document.getElementById('saving-modal');
    const title = document.getElementById('saving-modal-title');
    const form = document.getElementById('saving-form');
    
    if (saving) {
        title.textContent = 'Edit Savings Transaction';
        document.getElementById('saving-id').value = saving.id;
        document.getElementById('saving-member').value = saving.memberId;
        document.getElementById('saving-type').value = saving.type;
        document.getElementById('saving-amount').value = saving.amount;
        document.getElementById('saving-date').value = saving.date;
        document.getElementById('saving-notes').value = saving.notes || '';
    } else {
        title.textContent = 'New Savings Transaction';
        form.reset();
        document.getElementById('saving-date').value = new Date().toISOString().split('T')[0];
    }
    
    modal.style.display = 'flex';
    
    // Close modal when clicking on X
    modal.querySelector('.close').addEventListener('click', function() {
        modal.style.display = 'none';
    });
}

function saveSaving() {
    const id = document.getElementById('saving-id').value;
    const memberId = document.getElementById('saving-member').value;
    const type = document.getElementById('saving-type').value;
    const amount = parseFloat(document.getElementById('saving-amount').value);
    const date = document.getElementById('saving-date').value;
    const notes = document.getElementById('saving-notes').value;
    
    const savingData = {
        memberId,
        type,
        amount,
        date,
        notes
    };
    
    if (id) {
        // Update existing saving
        const index = savings.findIndex(s => s.id === id);
        if (index !== -1) {
            savings[index] = { ...savings[index], ...savingData };
        }
    } else {
        // Add new saving
        savingData.id = generateId();
        savings.push(savingData);
        
        // Add to transactions
        transactions.push({
            id: generateId(),
            type: 'saving',
            memberId,
            amount: type === 'deposit' ? amount : -amount,
            date,
            description: `${type === 'deposit' ? 'Savings deposit' : 'Savings withdrawal'}${notes ? ': ' + notes : ''}`
        });
    }
    
    saveData();
    document.getElementById('saving-modal').style.display = 'none';
    loadSavings();
    loadDashboard();
    loadTransactions();
}

function editSaving(id) {
    const saving = savings.find(s => s.id === id);
    if (saving) {
        showSavingModal(saving);
    }
}

function deleteSaving(id) {
    const saving = savings.find(s => s.id === id);
    if (saving) {
        savings = savings.filter(s => s.id !== id);
        transactions = transactions.filter(t => 
            !(t.type === 'saving' && t.memberId === saving.memberId && t.amount === (saving.type === 'deposit' ? saving.amount : -saving.amount) && t.date === saving.date)
        );
        
        saveData();
        loadSavings();
        loadDashboard();
        loadTransactions();
    }
}

// Loan Functions
function loadLoans() {
    const tbody = document.querySelector('#loans-table tbody');
    tbody.innerHTML = '';
    
    loans.forEach(loan => {
        const member = members.find(m => m.id === loan.memberId);
        const memberName = member ? member.name : 'Unknown';
        const dueDate = calculateDueDate(loan.startDate, loan.term);
        const balance = loan.amount - (loan.paid || 0);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${loan.id}</td>
            <td>${memberName}</td>
            <td>${formatCurrency(loan.amount)}</td>
            <td>${loan.interest}%</td>
            <td>${loan.term} months</td>
            <td>${formatDate(loan.startDate)}</td>
            <td>${formatDate(dueDate)}</td>
            <td>${formatCurrency(loan.paid || 0)}</td>
            <td>${formatCurrency(balance)}</td>
            <td><span class="status ${loan.status}">${loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</span></td>
            <td>
                ${loan.status === 'active' ? `
                <button class="btn btn-primary btn-sm repay-loan" data-id="${loan.id}"><i class="fas fa-money-bill-wave"></i></button>
                ` : ''}
                <button class="btn btn-primary btn-sm edit-loan" data-id="${loan.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm delete-loan" data-id="${loan.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.repay-loan').forEach(btn => {
        btn.addEventListener('click', function() {
            const loanId = this.getAttribute('data-id');
            showRepaymentModal(loanId);
        });
    });
    
    document.querySelectorAll('.edit-loan').forEach(btn => {
        btn.addEventListener('click', function() {
            const loanId = this.getAttribute('data-id');
            editLoan(loanId);
        });
    });
    
    document.querySelectorAll('.delete-loan').forEach(btn => {
        btn.addEventListener('click', function() {
            const loanId = this.getAttribute('data-id');
            confirmAction(
                'Delete Loan',
                'Are you sure you want to delete this loan? All related repayments will also be deleted.',
                () => deleteLoan(loanId)
            );
        });
    });
}

function filterLoans() {
    const memberFilter = document.getElementById('loan-member-filter').value;
    const statusFilter = document.getElementById('loan-status-filter').value;
    
    const rows = document.querySelectorAll('#loans-table tbody tr');
    
    rows.forEach(row => {
        const memberId = row.cells[1].textContent;
        const status = row.cells[9].textContent.toLowerCase();
        
        const memberMatch = !memberFilter || memberId === memberFilter;
        const statusMatch = !statusFilter || status === statusFilter;
        
        if (memberMatch && statusMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function showLoanModal(loan = null) {
    const modal = document.getElementById('loan-modal');
    const title = document.getElementById('loan-modal-title');
    const form = document.getElementById('loan-form');
    
    if (loan) {
        title.textContent = 'Edit Loan';
        document.getElementById('loan-id').value = loan.id;
        document.getElementById('loan-member').value = loan.memberId;
        document.getElementById('loan-amount').value = loan.amount;
        document.getElementById('loan-interest').value = loan.interest;
        document.getElementById('loan-term').value = loan.term;
        document.getElementById('loan-start-date').value = loan.startDate;
        document.getElementById('loan-purpose').value = loan.purpose || '';
    } else {
        title.textContent = 'New Loan';
        form.reset();
        document.getElementById('loan-start-date').value = new Date().toISOString().split('T')[0];
    }
    
    modal.style.display = 'flex';
    
    // Close modal when clicking on X
    modal.querySelector('.close').addEventListener('click', function() {
        modal.style.display = 'none';
    });
}

function saveLoan() {
    const id = document.getElementById('loan-id').value;
    const memberId = document.getElementById('loan-member').value;
    const amount = parseFloat(document.getElementById('loan-amount').value);
    const interest = parseFloat(document.getElementById('loan-interest').value);
    const term = parseInt(document.getElementById('loan-term').value);
    const startDate = document.getElementById('loan-start-date').value;
    const purpose = document.getElementById('loan-purpose').value;
    
    const loanData = {
        memberId,
        amount,
        interest,
        term,
        startDate,
        purpose,
        status: 'active',
        paid: 0
    };
    
    if (id) {
        // Update existing loan
        const index = loans.findIndex(l => l.id === id);
        if (index !== -1) {
            // Preserve paid amount and status
            loanData.paid = loans[index].paid;
            loanData.status = loans[index].status;
            loans[index] = { ...loans[index], ...loanData };
        }
    } else {
        // Add new loan
        loanData.id = generateId();
        loans.push(loanData);
        
        // Add to transactions
        transactions.push({
            id: generateId(),
            type: 'loan',
            memberId,
            amount: -amount, // Negative because it's money going out
            date: startDate,
            description: `Loan issued${purpose ? ' for: ' + purpose : ''}`
        });
    }
    
    saveData();
    document.getElementById('loan-modal').style.display = 'none';
    loadLoans();
    loadDashboard();
    loadTransactions();
}

function editLoan(id) {
    const loan = loans.find(l => l.id === id);
    if (loan) {
        showLoanModal(loan);
    }
}

function deleteLoan(id) {
    const loan = loans.find(l => l.id === id);
    if (loan) {
        loans = loans.filter(l => l.id !== id);
        transactions = transactions.filter(t => 
            !(t.type === 'loan' && t.memberId === loan.memberId && t.amount === -loan.amount && t.date === loan.startDate)
        );
        
        // Also remove any repayment transactions
        transactions = transactions.filter(t => 
            !(t.type === 'repayment' && t.description.includes(`Loan ${id}`))
        );
        
        saveData();
        loadLoans();
        loadDashboard();
        loadTransactions();
    }
}

function showRepaymentModal(loanId) {
    const modal = document.getElementById('repayment-modal');
    const loan = loans.find(l => l.id === loanId);
    
    if (loan) {
        document.getElementById('repayment-loan-id').value = loanId;
        document.getElementById('repayment-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('repayment-amount').value = (loan.amount * (1 + loan.interest/100) / loan.term).toFixed(2);
        
        modal.style.display = 'flex';
        
        // Close modal when clicking on X
        modal.querySelector('.close').addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
}

function saveRepayment() {
    const loanId = document.getElementById('repayment-loan-id').value;
    const amount = parseFloat(document.getElementById('repayment-amount').value);
    const date = document.getElementById('repayment-date').value;
    const notes = document.getElementById('repayment-notes').value;
    
    const loan = loans.find(l => l.id === loanId);
    if (loan) {
        // Update loan paid amount
        loan.paid = (loan.paid || 0) + amount;
        
        // Check if loan is fully paid
        const totalAmount = loan.amount * (1 + loan.interest/100);
        if (loan.paid >= totalAmount) {
            loan.status = 'paid';
            loan.paid = totalAmount; // Prevent overpayment
        }
        
        // Add repayment transaction
        transactions.push({
            id: generateId(),
            type: 'repayment',
            memberId: loan.memberId,
            amount,
            date,
            description: `Repayment for Loan ${loanId}${notes ? ': ' + notes : ''}`
        });
        
        saveData();
        document.getElementById('repayment-modal').style.display = 'none';
        loadLoans();
        loadDashboard();
        loadTransactions();
    }
}

// Transaction Functions
function loadTransactions() {
    const tbody = document.querySelector('#transactions-table tbody');
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
            <td>${getMemberName(transaction.memberId)}</td>
            <td>${formatCurrency(transaction.amount)}</td>
            <td>${transaction.description}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterTransactions() {
    const typeFilter = document.getElementById('transaction-type-filter').value;
    const dateFilter = document.getElementById('transaction-date-filter').value;
    
    const rows = document.querySelectorAll('#transactions-table tbody tr');
    
    rows.forEach(row => {
        const type = row.cells[1].textContent.toLowerCase();
        const date = row.cells[0].textContent;
        
        const typeMatch = !typeFilter || type === typeFilter;
        const dateMatch = !dateFilter || date === formatDate(dateFilter);
        
        if (typeMatch && dateMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Report Functions
function generateSavingsReport() {
    const resultsDiv = document.getElementById('report-results');
    resultsDiv.innerHTML = '<h3>Savings Report</h3>';
    
    // Total savings
    const totalSavings = savings.reduce((sum, saving) => {
        if (saving.type === 'deposit') return sum + saving.amount;
        if (saving.type === 'withdrawal') return sum - saving.amount;
        return sum;
    }, 0);
    
    resultsDiv.innerHTML += `<p><strong>Total Savings Balance:</strong> ${formatCurrency(totalSavings)}</p>`;
    
    // Savings by member
    const savingsByMember = {};
    members.forEach(member => {
        const balance = getMemberSavingsBalance(member.id);
        if (balance > 0) {
            savingsByMember[member.name] = balance;
        }
    });
    
    if (Object.keys(savingsByMember).length > 0) {
        resultsDiv.innerHTML += '<h4>Savings by Member</h4><ul>';
        for (const [name, balance] of Object.entries(savingsByMember)) {
            resultsDiv.innerHTML += `<li>${name}: ${formatCurrency(balance)}</li>`;
        }
        resultsDiv.innerHTML += '</ul>';
    }
    
    // Recent deposits
    const recentDeposits = savings
        .filter(s => s.type === 'deposit')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    if (recentDeposits.length > 0) {
        resultsDiv.innerHTML += '<h4>Recent Deposits</h4><table><thead><tr><th>Date</th><th>Member</th><th>Amount</th></tr></thead><tbody>';
        recentDeposits.forEach(deposit => {
            resultsDiv.innerHTML += `
                <tr>
                    <td>${formatDate(deposit.date)}</td>
                    <td>${getMemberName(deposit.memberId)}</td>
                    <td>${formatCurrency(deposit.amount)}</td>
                </tr>
            `;
        });
        resultsDiv.innerHTML += '</tbody></table>';
    }
}

function generateLoansReport() {
    const resultsDiv = document.getElementById('report-results');
    resultsDiv.innerHTML = '<h3>Loans Report</h3>';
    
    // Loan statistics
    const activeLoans = loans.filter(l => l.status === 'active');
    const paidLoans = loans.filter(l => l.status === 'paid');
    const defaultedLoans = loans.filter(l => l.status === 'defaulted');
    
    resultsDiv.innerHTML += `
        <p><strong>Active Loans:</strong> ${activeLoans.length}</p>
        <p><strong>Paid Loans:</strong> ${paidLoans.length}</p>
        <p><strong>Defaulted Loans:</strong> ${defaultedLoans.length}</p>
    `;
    
    // Total loan amounts
    const totalIssued = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalRepaid = loans.reduce((sum, loan) => sum + (loan.paid || 0), 0);
    const totalOutstanding = totalIssued - totalRepaid;
    
    resultsDiv.innerHTML += `
        <p><strong>Total Loans Issued:</strong> ${formatCurrency(totalIssued)}</p>
        <p><strong>Total Repaid:</strong> ${formatCurrency(totalRepaid)}</p>
        <p><strong>Total Outstanding:</strong> ${formatCurrency(totalOutstanding)}</p>
    `;
    
    // Active loans table
    if (activeLoans.length > 0) {
        resultsDiv.innerHTML += '<h4>Active Loans</h4><table><thead><tr><th>Member</th><th>Amount</th><th>Interest</th><th>Term</th><th>Due Date</th><th>Balance</th></tr></thead><tbody>';
        activeLoans.forEach(loan => {
            const dueDate = calculateDueDate(loan.startDate, loan.term);
            const balance = loan.amount - (loan.paid || 0);
            
            resultsDiv.innerHTML += `
                <tr>
                    <td>${getMemberName(loan.memberId)}</td>
                    <td>${formatCurrency(loan.amount)}</td>
                    <td>${loan.interest}%</td>
                    <td>${loan.term} months</td>
                    <td>${formatDate(dueDate)}</td>
                    <td>${formatCurrency(balance)}</td>
                </tr>
            `;
        });
        resultsDiv.innerHTML += '</tbody></table>';
    }
}

function generateMembersReport() {
    const resultsDiv = document.getElementById('report-results');
    resultsDiv.innerHTML = '<h3>Members Report</h3>';
    
    resultsDiv.innerHTML += `<p><strong>Total Members:</strong> ${members.length}</p>`;
    
    // Members table
    if (members.length > 0) {
        resultsDiv.innerHTML += '<table><thead><tr><th>Name</th><th>Phone</th><th>Join Date</th><th>Savings</th><th>Active Loans</th></tr></thead><tbody>';
        members.forEach(member => {
            const savingsBalance = getMemberSavingsBalance(member.id);
            const activeLoans = loans.filter(l => l.memberId === member.id && l.status === 'active').length;
            
            resultsDiv.innerHTML += `
                <tr>
                    <td>${member.name}</td>
                    <td>${member.phone}</td>
                    <td>${formatDate(member.joinDate)}</td>
                    <td>${formatCurrency(savingsBalance)}</td>
                    <td>${activeLoans}</td>
                </tr>
            `;
        });
        resultsDiv.innerHTML += '</tbody></table>';
    }
}

// Helper Functions
function updateMemberSelects() {
    const memberSelects = [
        document.getElementById('saving-member'),
        document.getElementById('loan-member'),
        document.getElementById('saving-member-filter'),
        document.getElementById('loan-member-filter')
    ];
    
    memberSelects.forEach(select => {
        if (!select) return;
        
        // Save current value
        const currentValue = select.value;
        
        // Clear options (except first if it's a filter)
        select.innerHTML = '';
        if (select.id.includes('filter')) {
            select.innerHTML = '<option value="">All Members</option>';
        } else {
            select.innerHTML = '<option value="">Select Member</option>';
        }
        
        // Add member options
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            select.appendChild(option);
        });
        
        // Restore current value if it still exists
        if (currentValue && members.some(m => m.id === currentValue)) {
            select.value = currentValue;
        }
    });
}

function getMemberName(id) {
    const member = members.find(m => m.id === id);
    return member ? member.name : 'Unknown';
}

function getMemberSavingsBalance(id) {
    return savings
        .filter(s => s.memberId === id)
        .reduce((balance, saving) => {
            if (saving.type === 'deposit') return balance + saving.amount;
            if (saving.type === 'withdrawal') return balance - saving.amount;
            return balance;
        }, 0);
}

function getMemberSavingsBalanceAtDate(id, date) {
    return savings
        .filter(s => s.memberId === id && new Date(s.date) <= new Date(date))
        .reduce((balance, saving) => {
            if (saving.type === 'deposit') return balance + saving.amount;
            if (saving.type === 'withdrawal') return balance - saving.amount;
            return balance;
        }, 0);
}

function calculateDueDate(startDate, termMonths) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + termMonths);
    return date.toISOString().split('T')[0];
}

function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function confirmAction(title, message, callback) {
    document.getElementById('confirmation-title').textContent = title;
    document.getElementById('confirmation-message').textContent = message;
    confirmationModal.style.display = 'flex';
    
    confirmOkBtn.onclick = function() {
        confirmationModal.style.display = 'none';
        callback();
    };
}

function saveData() {
    localStorage.setItem('members', JSON.stringify(members));
    localStorage.setItem('savings', JSON.stringify(savings));
    localStorage.setItem('loans', JSON.stringify(loans));
    localStorage.setItem('transactions', JSON.stringify(transactions));
}
