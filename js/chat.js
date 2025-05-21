document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');
    const chartContainer = document.querySelector('.chart-container');
    const visualizationPlaceholder = document.querySelector('.visualization-placeholder');
    const chartTitle = document.getElementById('chart-title');
    const chartArea = document.getElementById('chart-area');
    const downloadButton = document.querySelector('.download-chart');

    let currentChart = null;

    // Check if user is authenticated
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            // Redirect to auth page if not authenticated
            window.location.href = 'auth.html';
            return;
        }
        // Initialize chat after confirming authentication
        initializeChat(user.uid);
    });

    function initializeChat(userId) {
        // Get connection details from localStorage
        const connectionDetails = JSON.parse(localStorage.getItem('dbConnection'));
        console.log('Connection Details:', connectionDetails);
        
        if (!connectionDetails) {
            console.error('No connection details found in localStorage');
            window.location.href = 'connection.html';
            return;
        }

        // Add initial bot message
        addMessage('Hello! I can help you analyze your database. What would you like to know?', 'bot');

        // Send message function
        async function sendMessage() {
            const message = chatInput.value.trim();
            if (!message) return;

            console.log('Sending message:', message);

            // Add user message to chat
            addMessage(message, 'user');
            chatInput.value = '';

            try {
                console.log('Making API request to generate-query...');
                const response = await fetch('http://127.0.0.1:8000/generate-query', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        connection_id: userId, // Use Firebase user UID
                        message: message
                    })
                });

                console.log('API Response status:', response.status);
                const data = await response.json();
                console.log('API Response data:', data);

                if (data.status === 'success') {
                    console.log('Success response received');
                    // Add bot reply
                    addMessage(data.reply, 'bot');

                    // Show visualization
                    if (data.visualization) {
                        console.log('Visualization data:', data.visualization);
                        showVisualization(data.visualization);
                    } else {
                        console.log('No visualization data in response');
                    }
                } else {
                    console.error('API returned error status:', data);
                    throw new Error(data.detail || 'Failed to generate query');
                }
            } catch (error) {
                console.error('Error in sendMessage:', error);
                addMessage('Sorry, I encountered an error: ' + error.message, 'bot');
            }
        }

        // Add message to chat
        function addMessage(text, sender) {
            console.log(`Adding ${sender} message:`, text);
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            messageDiv.textContent = text;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Show visualization
        function showVisualization(visualizationData) {
            console.log('Showing visualization:', visualizationData);
            visualizationPlaceholder.classList.add('hidden');
            chartContainer.classList.remove('hidden');
            
            // Update chart title
            chartTitle.textContent = visualizationData.title;
            
            // Destroy existing chart if any
            if (currentChart) {
                console.log('Destroying existing chart');
                currentChart.destroy();
            }

            try {
                // Create canvas element if it doesn't exist
                let canvas = chartArea.querySelector('canvas');
                if (!canvas) {
                    canvas = document.createElement('canvas');
                    chartArea.innerHTML = ''; // Clear any existing content
                    chartArea.appendChild(canvas);
                }

                // Create new chart based on type
                const ctx = canvas.getContext('2d');
                const chartConfig = getChartConfig(visualizationData);
                console.log('Chart configuration:', chartConfig);
                
                currentChart = new Chart(ctx, chartConfig);
                console.log('New chart created successfully');
            } catch (error) {
                console.error('Error creating chart:', error);
                addMessage('Sorry, there was an error creating the visualization.', 'bot');
            }
        }

        // Get chart configuration based on type
        function getChartConfig(visualizationData) {
            console.log('Getting chart config for type:', visualizationData.type);
            const commonConfig = {
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: visualizationData.title,
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        subtitle: {
                            display: true,
                            text: visualizationData.subtitle,
                            font: {
                                size: 14
                            }
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    }
                }
            };

            let config;
            switch (visualizationData.type) {
                case 'bar':
                    config = {
                        type: 'bar',
                        data: {
                            labels: visualizationData.data.labels,
                            datasets: [{
                                label: visualizationData.title,
                                data: visualizationData.data.values,
                                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                                borderColor: 'rgba(79, 70, 229, 1)',
                                borderWidth: 1
                            }]
                        }
                    };
                    break;

                case 'line':
                    config = {
                        type: 'line',
                        data: {
                            labels: visualizationData.data.labels,
                            datasets: [{
                                label: visualizationData.title,
                                data: visualizationData.data.values,
                                borderColor: 'rgba(79, 70, 229, 1)',
                                tension: 0.1,
                                fill: false
                            }]
                        }
                    };
                    break;

                case 'pie':
                    config = {
                        type: 'pie',
                        data: {
                            labels: visualizationData.data.labels,
                            datasets: [{
                                data: visualizationData.data.values,
                                backgroundColor: [
                                    'rgba(79, 70, 229, 0.8)',
                                    'rgba(99, 102, 241, 0.8)',
                                    'rgba(129, 140, 248, 0.8)',
                                    'rgba(165, 180, 252, 0.8)'
                                ]
                            }]
                        }
                    };
                    break;

                case 'scatter':
                    config = {
                        type: 'scatter',
                        data: {
                            datasets: [{
                                label: visualizationData.title,
                                data: visualizationData.data.values.map((value, index) => ({
                                    x: index,
                                    y: value
                                })),
                                backgroundColor: 'rgba(79, 70, 229, 0.8)'
                            }]
                        }
                    };
                    break;

                default:
                    console.warn('Unknown chart type:', visualizationData.type);
                    config = {};
            }

            console.log('Generated chart config:', config);
            return { ...config, ...commonConfig };
        }

        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Download chart handler
        downloadButton.addEventListener('click', () => {
            if (currentChart) {
                console.log('Downloading chart:', chartTitle.textContent);
                const canvas = chartArea.querySelector('canvas');
                const link = document.createElement('a');
                link.download = `${chartTitle.textContent}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        });
    }
}); 