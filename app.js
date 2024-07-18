const usersKey = 'users';
const attendanceKey = 'attendance';
const adminEmail = "snoormuhammad37@gmail.com"
const adminPassword = '123'; // Admin password

document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem(usersKey) === null) {
        localStorage.setItem(usersKey, JSON.stringify([]));
    }
    if (localStorage.getItem(attendanceKey) === null) {
        localStorage.setItem(attendanceKey, JSON.stringify({}));
    }
});

function showRegistration() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('registration-container').style.display = 'block';
}

function showLogin() {
    document.getElementById('registration-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const rollno = document.getElementById('reg-rollno').value;
    const password = document.getElementById('reg-password').value;

    if (username && email && rollno && password) {
        const users = JSON.parse(localStorage.getItem(usersKey));
        users.push({ username, email, rollno, password });
        localStorage.setItem(usersKey, JSON.stringify(users));
        alert('Registration successful');
        showLogin();
    } else {
        alert('Please fill out all fields');
    }
}

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const users = JSON.parse(localStorage.getItem(usersKey));

    if (email === adminEmail && password === adminPassword) {
        showAdminDashboard();
    } else {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            showUserDashboard(user);
        } else {
            alert('Invalid email or password');
        }
    }
}

function logout() {
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('user-dashboard').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

function showAdminDashboard() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';

    const users = JSON.parse(localStorage.getItem(usersKey));
    const attendance = JSON.parse(localStorage.getItem(attendanceKey));
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';

    users.forEach(user => {
        const attendanceDates = attendance[user.rollno] || [];
        const attendancePercentage = calculateAttendancePercentage(attendanceDates);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.rollno}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${attendanceDates.join(', ') || 'No records'}</td>
            <td>${attendancePercentage}%</td>
            <td><button onclick="markPresent('${user.rollno}')">Mark Present</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function showUserDashboard(user) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('user-dashboard').style.display = 'block';

    document.getElementById('user-info').innerText = `Name: ${user.username}\nRoll No: ${user.rollno}\nEmail: ${user.email}`;

    const attendance = JSON.parse(localStorage.getItem(attendanceKey));
    const attendanceDates = attendance[user.rollno] || [];
    const attendancePercentage = calculateAttendancePercentage(attendanceDates);

    document.getElementById('attendance-percentage').innerText = `Attendance Percentage: ${attendancePercentage}%`;

    const tbody = document.getElementById('user-attendance-body');
    tbody.innerHTML = '';

    const dates = attendance[user.rollno] || [];
    const today = new Date().toISOString().split('T')[0];

    const datesMap = {};
    dates.forEach(date => {
        datesMap[date] = 'Present';
    });
    if (!datesMap[today]) {
        datesMap[today] = 'Absent';
    }

    Object.keys(datesMap).forEach(date => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${date}</td>
            <td>${datesMap[date]}</td>
        `;
        tbody.appendChild(tr);
    });
}

function markPresent(rollno) {
    const attendance = JSON.parse(localStorage.getItem(attendanceKey));
    const today = new Date().toISOString().split('T')[0];

    if (!attendance[rollno]) {
        attendance[rollno] = [];
    }
    if (!attendance[rollno].includes(today)) {
        attendance[rollno].push(today);
    }

    localStorage.setItem(attendanceKey, JSON.stringify(attendance));
    showAdminDashboard();
}

function calculateAttendancePercentage(attendanceDates) {
    const startDate = new Date('2023-07-01'); // Start date for attendance calculation
    const today = new Date();
    const totalDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1; // Total days from start date to today
    const presentDays = attendanceDates.length;
    return ((presentDays / totalDays) * 100).toFixed(2);
}

function searchUser() {
    const searchInput = document.getElementById('search-input');
    const searchValue = searchInput.value.trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem(usersKey));

    const results = users.filter(user =>
        user.rollno.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
    );

    const adminDashboard = document.getElementById('admin-dashboard');
    const attendanceContainer = document.getElementById('user-dashboard');

    if (searchValue) {
        // Hide attendance container and user dashboard
        attendanceContainer.style.display = 'none';
        adminDashboard.style.display = 'block'; // Show admin dashboard
        // Show search results or no results found
        showSearchResults(results);
    } else {
        // Show attendance container and hide user dashboard
        attendanceContainer.style.display = 'none'; // Ensure it is hidden
        adminDashboard.style.display = 'block'; // Show admin dashboard
        clearSearchResults(); // Clear search results
    }
}

function showSearchResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';

    if (results.length > 0) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        thead.innerHTML = `
    <tr>
        <th>Roll No</th>
        <th>Name</th>
        <th>Email</th>
    </tr>
`;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        results.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${user.rollno}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
    `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        searchResults.appendChild(table);
    } else {
        searchResults.innerHTML = 'No results found';
    }
}

function clearSearchResults() {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
}