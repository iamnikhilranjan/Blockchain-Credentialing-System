window.onerror = function (message, source, lineno, colno, error) {
    const errorContainer = document.createElement('div');
    errorContainer.style.position = 'fixed';
    errorContainer.style.top = '0';
    errorContainer.style.left = '0';
    errorContainer.style.width = '100vw';
    errorContainer.style.height = '100vh';
    errorContainer.style.backgroundColor = 'rgba(0,0,0,0.9)';
    errorContainer.style.color = 'white';
    errorContainer.style.padding = '20px';
    errorContainer.style.zIndex = '9999';
    errorContainer.style.fontFamily = 'monospace';
    errorContainer.style.whiteSpace = 'pre-wrap';
    errorContainer.style.overflow = 'auto';

    const time = new Date().toLocaleTimeString();
    const errorMessage = `[${time}] Global Error Caught:\nMessage: ${message}\nSource: ${source}:${lineno}:${colno}\nStack: ${error ? error.stack : 'No stack trace'}`;

    errorContainer.textContent = errorMessage;
    document.body.appendChild(errorContainer);

    console.error(errorMessage);
};
