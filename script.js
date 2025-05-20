// DOM Elements
const landingPage = document.getElementById('landing-page');
const credentialsScreen = document.getElementById('credentials-screen');
const chatScreen = document.getElementById('chat-screen');
const dbCredentialsForm = document.getElementById('db-credentials-form');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendMessageBtn = document.getElementById('send-message');
const chartTypeSelect = document.getElementById('chart-type');
const chartArea = document.getElementById('chart-area');
const chartContainer = document.querySelector('.chart-container');
const visualizationPlaceholder = document.querySelector('.visualization-placeholder');

// Chart instance
let currentChart = null;

// Navigation Functions
function showCredentialsScreen() {
    landingPage.classList.add('hidden-section');
    credentialsScreen.classList.remove('hidden-section');
}

function showChatScreen() {
    credentialsScreen.classList.add('hidden-section');
    chatScreen.classList.remove('hidden-section');
}

// Form Handling
dbCredentialsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.test-connect-btn');
    const btnText = submitBtn.querySelector('span');
    const spinner = submitBtn.querySelector('.spinner');
    
    // Show loading state
    btnText.style.display = 'none';
    spinner.classList.remove('hidden');
    
    // Simulate connection test (replace with actual API call)
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        showChatScreen();
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        // Reset button state
        btnText.style.display = 'inline';
        spinner.classList.add('hidden');
    }
});

// Chat Functions
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleSendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    chatInput.value = '';
    
    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
        const botResponse = "I've analyzed your data and created a visualization.";
        addMessage(botResponse);
        
        // Show chart (replace with actual data)
        showChart({
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            data: [12, 19, 3, 5, 2]
        });
    }, 1000);
}

// Event Listeners for Chat
sendMessageBtn.addEventListener('click', handleSendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

// Chart Functions
function showChart(data) {
    visualizationPlaceholder.classList.add('hidden');
    chartContainer.classList.remove('hidden');
    
    if (currentChart) {
        currentChart.destroy();
    }
    
    const ctx = document.createElement('canvas');
    chartArea.innerHTML = '';
    chartArea.appendChild(ctx);
    
    currentChart = new Chart(ctx, {
        type: chartTypeSelect.value,
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Data Analysis',
                data: data.data,
                backgroundColor: [
                    'rgba(79, 70, 229, 0.6)',
                    'rgba(129, 140, 248, 0.6)',
                    'rgba(165, 180, 252, 0.6)',
                    'rgba(192, 132, 252, 0.6)',
                    'rgba(217, 70, 239, 0.6)'
                ],
                borderColor: [
                    'rgba(79, 70, 229, 1)',
                    'rgba(129, 140, 248, 1)',
                    'rgba(165, 180, 252, 1)',
                    'rgba(192, 132, 252, 1)',
                    'rgba(217, 70, 239, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

// Chart Type Change Handler
chartTypeSelect.addEventListener('change', () => {
    if (currentChart) {
        currentChart.config.type = chartTypeSelect.value;
        currentChart.update();
    }
});

// Download Chart Handler
document.querySelector('.download-chart').addEventListener('click', () => {
    if (!currentChart) return;
    
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = currentChart.canvas.toDataURL('image/png');
    link.click();
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