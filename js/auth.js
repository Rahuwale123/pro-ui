document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
    const submitBtn = document.getElementById('submitBtn');
    const switchModeBtn = document.getElementById('switchMode');
    const switchText = document.getElementById('switchText');
    const errorMessage = document.getElementById('errorMessage');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const authForm = document.querySelector('.auth-form');
    const authBox = document.querySelector('.auth-box');

    let isSignUp = false;

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('ri-eye-line');
        togglePassword.classList.toggle('ri-eye-off-line');
    });

    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        toggleConfirmPassword.classList.toggle('ri-eye-line');
        toggleConfirmPassword.classList.toggle('ri-eye-off-line');
    });

    // Switch between Sign In and Sign Up
    switchModeBtn.addEventListener('click', () => {
        isSignUp = !isSignUp;
        confirmPasswordGroup.style.display = isSignUp ? 'block' : 'none';
        submitBtn.querySelector('span').textContent = isSignUp ? 'Sign Up' : 'Sign In';
        switchText.textContent = isSignUp ? 'Already have an account?' : 'Don\'t have an account?';
        switchModeBtn.textContent = isSignUp ? 'Sign In' : 'Sign Up';
        errorMessage.textContent = '';
    });

    // Show error with animation
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('shake');
        setTimeout(() => {
            errorMessage.classList.remove('shake');
        }, 500);
    }

    // Set loading state
    function setLoading(isLoading) {
        submitBtn.classList.toggle('loading', isLoading);
        authForm.classList.toggle('loading', isLoading);
        submitBtn.disabled = isLoading;
    }

    // Check for existing database connection
    async function checkExistingConnection(userId) {
        try {
            const response = await fetch('http://127.0.0.1:8000/check-connection', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    connection_id: userId
                })
            });

            const data = await response.json();
            return data.exists === true;
        } catch (error) {
            console.error('Error checking connection:', error);
            return false;
        }
    }

    // Handle form submission
    submitBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Clear previous error
        errorMessage.textContent = '';

        // Validate inputs
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            
            let userCredential;
            if (isSignUp) {
                // Sign Up
                userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            } else {
                // Sign In
                userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            }
            
            // Show success animation
            authBox.classList.add('success');

            // Check for existing connection
            const hasConnection = await checkExistingConnection(userCredential.user.uid);
            
            // Wait for animation to complete before redirecting
            setTimeout(() => {
                if (hasConnection) {
                    // If connection exists, go directly to chat
                    window.location.href = 'chat.html';
                } else {
                    // If no connection, go to connection page
                    window.location.href = 'connection.html';
                }
            }, 500);
            
        } catch (error) {
            setLoading(false);
            showError(error.message);
        }
    });

    // Check if user is already logged in
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            try {
                // Check for existing connection
                const hasConnection = await checkExistingConnection(user.uid);
                if (hasConnection) {
                    // If connection exists, go directly to chat
                    window.location.href = 'chat.html';
                } else {
                    // If no connection, go to connection page
                    window.location.href = 'connection.html';
                }
            } catch (error) {
                console.error('Error checking connection:', error);
                // If there's an error checking connection, default to connection page
                window.location.href = 'connection.html';
            }
        }
    });
}); 