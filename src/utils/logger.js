/**
 * Logger utility for the Simple Land Simulation
 * Provides logging functionality with different levels and on-screen display
 */
class Logger {
    /**
     * Log levels
     */
    static levels = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    };
    
    /**
     * Current log level
     */
    static currentLevel = Logger.levels.INFO;
    
    /**
     * Maximum number of log entries to keep in the UI
     */
    static maxLogEntries = 50;
    
    /**
     * Whether to auto-hide the log panel
     */
    static autoHide = true;
    
    /**
     * Initialize the logger
     */
    static init() {
        // Create log panel if it doesn't exist
        if (!document.getElementById('log-panel')) {
            Logger.createLogPanel();
        }
        
        // Add keyboard shortcut to toggle log panel
        document.addEventListener('keydown', (event) => {
            if (event.key === 'l' || event.key === 'L') {
                Logger.toggleLogPanel();
            }
        });
        
        Logger.info('Logger initialized');
    }
    
    /**
     * Create the log panel
     */
    static createLogPanel() {
        // Create log panel
        const logPanel = document.createElement('div');
        logPanel.id = 'log-panel';
        logPanel.style.position = 'absolute';
        logPanel.style.bottom = '10px';
        logPanel.style.left = '10px';
        logPanel.style.width = '80%';
        logPanel.style.maxHeight = '200px';
        logPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        logPanel.style.color = 'white';
        logPanel.style.padding = '10px';
        logPanel.style.borderRadius = '5px';
        logPanel.style.fontFamily = 'monospace';
        logPanel.style.fontSize = '12px';
        logPanel.style.overflow = 'auto';
        logPanel.style.display = 'none'; // Hidden by default
        
        // Create log header
        const logHeader = document.createElement('div');
        logHeader.style.display = 'flex';
        logHeader.style.justifyContent = 'space-between';
        logHeader.style.marginBottom = '5px';
        logHeader.style.borderBottom = '1px solid #555';
        logHeader.style.paddingBottom = '5px';
        
        // Create log title
        const logTitle = document.createElement('div');
        logTitle.textContent = 'Log Panel (Press L to toggle)';
        logTitle.style.fontWeight = 'bold';
        
        // Create log controls
        const logControls = document.createElement('div');
        
        // Create log level selector
        const logLevelSelector = document.createElement('select');
        logLevelSelector.id = 'log-level-selector';
        logLevelSelector.style.marginLeft = '10px';
        logLevelSelector.style.backgroundColor = '#333';
        logLevelSelector.style.color = 'white';
        logLevelSelector.style.border = '1px solid #555';
        logLevelSelector.style.borderRadius = '3px';
        logLevelSelector.style.padding = '2px';
        
        // Add log level options
        for (const level in Logger.levels) {
            const option = document.createElement('option');
            option.value = Logger.levels[level];
            option.textContent = level;
            if (Logger.levels[level] === Logger.currentLevel) {
                option.selected = true;
            }
            logLevelSelector.appendChild(option);
        }
        
        // Add event listener to log level selector
        logLevelSelector.addEventListener('change', (event) => {
            Logger.currentLevel = parseInt(event.target.value);
            Logger.info(`Log level set to ${Object.keys(Logger.levels).find(key => Logger.levels[key] === Logger.currentLevel)}`);
        });
        
        // Create clear button
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear';
        clearButton.style.marginLeft = '10px';
        clearButton.style.backgroundColor = '#333';
        clearButton.style.color = 'white';
        clearButton.style.border = '1px solid #555';
        clearButton.style.borderRadius = '3px';
        clearButton.style.padding = '2px 5px';
        
        // Add event listener to clear button
        clearButton.addEventListener('click', () => {
            Logger.clearLogs();
        });
        
        // Add controls to log controls
        logControls.appendChild(document.createTextNode('Level:'));
        logControls.appendChild(logLevelSelector);
        logControls.appendChild(clearButton);
        
        // Add title and controls to header
        logHeader.appendChild(logTitle);
        logHeader.appendChild(logControls);
        
        // Create log content
        const logContent = document.createElement('div');
        logContent.id = 'log-content';
        
        // Add header and content to panel
        logPanel.appendChild(logHeader);
        logPanel.appendChild(logContent);
        
        // Add panel to document
        document.body.appendChild(logPanel);
    }
    
    /**
     * Toggle the log panel
     */
    static toggleLogPanel() {
        const logPanel = document.getElementById('log-panel');
        if (logPanel) {
            if (logPanel.style.display === 'none') {
                logPanel.style.display = 'block';
            } else {
                logPanel.style.display = 'none';
            }
        }
    }
    
    /**
     * Clear all logs
     */
    static clearLogs() {
        const logContent = document.getElementById('log-content');
        if (logContent) {
            logContent.innerHTML = '';
        }
    }
    
    /**
     * Log an error message
     * @param {string} message - The message to log
     * @param  {...any} args - Additional arguments
     */
    static error(message, ...args) {
        if (Logger.currentLevel >= Logger.levels.ERROR) {
            console.error(`[ERROR] ${message}`, ...args);
            Logger.addLogEntry('error', message, args);
            
            // Show log panel for errors
            if (Logger.autoHide) {
                const logPanel = document.getElementById('log-panel');
                if (logPanel && logPanel.style.display === 'none') {
                    logPanel.style.display = 'block';
                    
                    // Auto-hide after 5 seconds
                    setTimeout(() => {
                        logPanel.style.display = 'none';
                    }, 5000);
                }
            }
        }
    }
    
    /**
     * Log a warning message
     * @param {string} message - The message to log
     * @param  {...any} args - Additional arguments
     */
    static warn(message, ...args) {
        if (Logger.currentLevel >= Logger.levels.WARN) {
            console.warn(`[WARN] ${message}`, ...args);
            Logger.addLogEntry('warn', message, args);
        }
    }
    
    /**
     * Log an info message
     * @param {string} message - The message to log
     * @param  {...any} args - Additional arguments
     */
    static info(message, ...args) {
        if (Logger.currentLevel >= Logger.levels.INFO) {
            console.info(`[INFO] ${message}`, ...args);
            Logger.addLogEntry('info', message, args);
        }
    }
    
    /**
     * Log a debug message
     * @param {string} message - The message to log
     * @param  {...any} args - Additional arguments
     */
    static debug(message, ...args) {
        if (Logger.currentLevel >= Logger.levels.DEBUG) {
            console.debug(`[DEBUG] ${message}`, ...args);
            Logger.addLogEntry('debug', message, args);
        }
    }
    
    /**
     * Add a log entry to the log panel
     * @param {string} level - The log level
     * @param {string} message - The message to log
     * @param {Array} args - Additional arguments
     */
    static addLogEntry(level, message, args) {
        const logContent = document.getElementById('log-content');
        if (!logContent) return;
        
        // Create log entry
        const logEntry = document.createElement('div');
        logEntry.className = `log-${level}`;
        
        // Set log entry style based on level
        switch (level) {
            case 'error':
                logEntry.style.color = '#ff5555';
                break;
            case 'warn':
                logEntry.style.color = '#ffaa55';
                break;
            case 'info':
                logEntry.style.color = '#55aaff';
                break;
            case 'debug':
                logEntry.style.color = '#aaaaaa';
                break;
        }
        
        // Create timestamp
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        
        // Create log message
        let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        // Add arguments if any
        if (args && args.length > 0) {
            // Convert arguments to string
            const argsString = args.map(arg => {
                if (arg instanceof Error) {
                    return arg.message;
                } else if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg);
                    } catch (error) {
                        return String(arg);
                    }
                } else {
                    return String(arg);
                }
            }).join(', ');
            
            logMessage += ` ${argsString}`;
        }
        
        // Set log entry content
        logEntry.textContent = logMessage;
        
        // Add log entry to log content
        logContent.appendChild(logEntry);
        
        // Scroll to bottom
        logContent.scrollTop = logContent.scrollHeight;
        
        // Limit number of log entries
        while (logContent.children.length > Logger.maxLogEntries) {
            logContent.removeChild(logContent.firstChild);
        }
    }
    
    /**
     * Set the current log level
     * @param {number} level - The log level
     */
    static setLevel(level) {
        Logger.currentLevel = level;
        
        // Update log level selector
        const logLevelSelector = document.getElementById('log-level-selector');
        if (logLevelSelector) {
            logLevelSelector.value = level;
        }
    }
}

// Initialize logger when the page loads
window.addEventListener('load', () => {
    Logger.init();
});

// Make logger globally available
window.Logger = Logger;
