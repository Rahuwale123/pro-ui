document.addEventListener('DOMContentLoaded', () => {
    const dbCredentialsForm = document.getElementById('db-credentials-form');
    const toast = document.getElementById('toast');
    const closeIcon = toast.querySelector('.close');
    
    // Check if user is authenticated and has existing connection
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            // Redirect to auth page if not authenticated
            window.location.href = 'auth.html';
            return;
        }

        try {
            // Check for existing connection
            const response = await fetch('http://127.0.0.1:8000/check-connection', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    connection_id: user.uid
                })
            });

            const data = await response.json();
            if (data.has_connection === true) {
                // Store connection details in localStorage
                localStorage.setItem('dbConnection', JSON.stringify(data.connection));
                // If connection exists, redirect to chat
                window.location.href = 'chat.html';
                return;
            }
        } catch (error) {
            console.error('Error checking connection:', error);
            // Continue showing connection form if there's an error
        }
    });

    // Initialize floating labels
    document.querySelectorAll('.input-group input').forEach(input => {
        if (input.value) {
            input.classList.add('has-value');
        }
        
        input.addEventListener('focus', () => {
            input.classList.add('has-value');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.classList.remove('has-value');
            }
        });
    });

    // Toast functions
    function showToast() {
        toast.classList.add('active');
        setTimeout(() => {
            toast.classList.remove('active');
        }, 5000); // Hide after 5 seconds
    }

    function hideToast() {
        toast.classList.remove('active');
    }

    // Close toast on click
    closeIcon.addEventListener('click', hideToast);
    
    // Form submission handler
    dbCredentialsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('.test-connect-btn');
        const btnText = submitBtn.querySelector('span');
        const spinner = submitBtn.querySelector('.spinner');
        
        // Show loading state
        btnText.style.display = 'none';
        spinner.classList.remove('hidden');
        
        // Get form values
        const hostname = document.getElementById('hostname').value;
        const port = document.getElementById('port').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const database = document.getElementById('dbname').value;

        try {
            // Get current user
            const user = firebase.auth().currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const response = await fetch('http://127.0.0.1:8000/connect-database', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hostname: hostname,
                    port: parseInt(port),
                    username: username,
                    password: password,
                    database: database,
                    connection_id: user.uid
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store connection details in localStorage
                localStorage.setItem('dbConnection', JSON.stringify({
                    hostname,
                    port,
                    username,
                    database,
                    connection_id: user.uid
                }));
                
                // Show success toast
                showToast();
                
                // Wait for toast to be visible before redirecting
                setTimeout(() => {
                    window.location.href = 'chat.html';
                }, 2000);
            } else {
                throw new Error(data.detail || 'Connection failed');
            }
        } catch (error) {
            alert('Connection failed: ' + error.message);
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            spinner.classList.add('hidden');
        }
    });
}); 