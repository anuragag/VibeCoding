// Backend Server for Snowflake Cortex Agent API Integration
// This server handles secure communication with Snowflake

import express from 'express';
import cors from 'cors';
import snowflake from 'snowflake-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Snowflake connection pool
const connectionPool = new Map();

// Helper function to get or create Snowflake connection
async function getSnowflakeConnection(config) {
    const key = `${config.account}-${config.username}`;

    if (connectionPool.has(key)) {
        return connectionPool.get(key);
    }

    return new Promise((resolve, reject) => {
        const connection = snowflake.createConnection({
            account: config.account,
            username: config.username,
            password: config.password,
            warehouse: config.warehouse,
            database: config.database,
            schema: config.schema
        });

        connection.connect((err, conn) => {
            if (err) {
                console.error('Unable to connect to Snowflake:', err);
                reject(err);
            } else {
                console.log('Successfully connected to Snowflake');
                connectionPool.set(key, connection);
                resolve(connection);
            }
        });
    });
}

// Helper function to execute Snowflake query
function executeQuery(connection, sqlText, binds = []) {
    return new Promise((resolve, reject) => {
        connection.execute({
            sqlText: sqlText,
            binds: binds,
            complete: (err, stmt, rows) => {
                if (err) {
                    console.error('Failed to execute query:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        });
    });
}

// API endpoint for Cortex Agent interaction
app.post('/api/cortex-agent', async (req, res) => {
    try {
        const { account, username, password, warehouse, database, schema, agent, message, conversation } = req.body;

        // Validate required fields
        if (!account || !username || !password || !agent || !message) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Get Snowflake connection
        const connection = await getSnowflakeConnection({
            account,
            username,
            password,
            warehouse: warehouse || 'COMPUTE_WH',
            database: database || 'CORTEX_DB',
            schema: schema || 'AGENTS'
        });

        // Build conversation context for better responses
        let fullPrompt = message;
        if (conversation && conversation.length > 0) {
            // Include recent conversation history (last 5 messages)
            const recentHistory = conversation.slice(-5)
                .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
                .join('\n');
            fullPrompt = `Previous conversation:\n${recentHistory}\n\nUser: ${message}\n\nAssistant:`;
        }

        // Call Cortex Agent using Snowflake's CORTEX.COMPLETE function
        // Syntax: CORTEX.COMPLETE(model_name, prompt_text)
        const query = `
            SELECT SNOWFLAKE.CORTEX.COMPLETE(?, ?) AS response
        `;

        // Execute the query
        const result = await executeQuery(
            connection,
            query,
            [agent, fullPrompt]
        );

        // Extract the response
        const response = result && result[0] ? result[0].RESPONSE : 'No response from agent';

        res.json({
            success: true,
            response: response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error processing Cortex Agent request:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Alternative endpoint using Cortex Agent REST API
app.post('/api/cortex-agent-rest', async (req, res) => {
    try {
        const { account, username, password, warehouse, database, schema, agent, message } = req.body;

        // This is an example of how you might call a Cortex Agent REST endpoint
        // Adjust based on your actual Cortex Agent configuration

        const endpoint = `https://${account}.snowflakecomputing.com/api/v2/cortex/agents/${agent}/chat`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getSnowflakeToken(account, username, password)}`
            },
            body: JSON.stringify({
                message: message,
                warehouse: warehouse,
                database: database,
                schema: schema
            })
        });

        if (!response.ok) {
            throw new Error(`Cortex Agent API error: ${response.status}`);
        }

        const data = await response.json();

        res.json({
            success: true,
            response: data.response || data.message,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error calling Cortex Agent REST API:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Helper function to get Snowflake authentication token
async function getSnowflakeToken(account, username, password) {
    // Implement OAuth or JWT token generation here
    // This is a placeholder - implement based on your Snowflake setup
    return 'your-auth-token';
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// List available Cortex models and agents
app.post('/api/list-agents', async (req, res) => {
    try {
        const { account, username, password, warehouse, database, schema } = req.body;

        // Pre-defined Cortex models available in Snowflake
        const predefinedModels = [
            {
                name: 'mistral-large',
                type: 'model',
                provider: 'Mistral AI',
                description: 'Best quality, complex reasoning tasks',
                size: 'Large',
                recommended: true
            },
            {
                name: 'mistral-large2',
                type: 'model',
                provider: 'Mistral AI',
                description: 'Latest Mistral large model, improved performance',
                size: 'Large',
                recommended: true
            },
            {
                name: 'mixtral-8x7b',
                type: 'model',
                provider: 'Mistral AI',
                description: 'Good balance of speed and quality',
                size: 'Medium'
            },
            {
                name: 'llama3-70b',
                type: 'model',
                provider: 'Meta',
                description: 'High quality responses',
                size: 'Large'
            },
            {
                name: 'llama3-8b',
                type: 'model',
                provider: 'Meta',
                description: 'Fast responses, good for simple tasks',
                size: 'Small'
            },
            {
                name: 'llama3.1-70b',
                type: 'model',
                provider: 'Meta',
                description: 'Latest Llama 3.1, improved capabilities',
                size: 'Large'
            },
            {
                name: 'llama3.1-8b',
                type: 'model',
                provider: 'Meta',
                description: 'Latest Llama 3.1, efficient and fast',
                size: 'Small'
            },
            {
                name: 'mistral-7b',
                type: 'model',
                provider: 'Mistral AI',
                description: 'Lightweight, cost-effective',
                size: 'Small'
            },
            {
                name: 'gemma-7b',
                type: 'model',
                provider: 'Google',
                description: 'Google\'s open model',
                size: 'Small'
            },
            {
                name: 'reka-flash',
                type: 'model',
                provider: 'Reka AI',
                description: 'Very fast inference',
                size: 'Medium'
            },
            {
                name: 'snowflake-arctic',
                type: 'model',
                provider: 'Snowflake',
                description: 'Snowflake\'s enterprise-grade model',
                size: 'Large'
            }
        ];

        const agents = [...predefinedModels];

        // If credentials provided, try to query for custom Cortex Agents
        if (account && username && password) {
            try {
                const connection = await getSnowflakeConnection({
                    account,
                    username,
                    password,
                    warehouse: warehouse || 'COMPUTE_WH',
                    database: database || 'CORTEX_DB',
                    schema: schema || 'AGENTS'
                });

                // Query for Cortex Search Services (one type of Cortex Agent)
                try {
                    const searchServices = await executeQuery(
                        connection,
                        'SHOW CORTEX SEARCH SERVICES'
                    );

                    if (searchServices && searchServices.length > 0) {
                        searchServices.forEach(service => {
                            agents.push({
                                name: service.name,
                                type: 'search_service',
                                provider: 'Custom',
                                description: `Cortex Search Service in ${service.database_name}.${service.schema_name}`,
                                size: 'Custom'
                            });
                        });
                    }
                } catch (err) {
                    console.log('No Cortex Search Services found or permission denied:', err.message);
                }

                // Query for custom functions that might be Cortex Agents
                try {
                    const functions = await executeQuery(
                        connection,
                        `SHOW USER FUNCTIONS LIKE '%CORTEX%' IN SCHEMA ${schema || 'AGENTS'}`
                    );

                    if (functions && functions.length > 0) {
                        functions.forEach(func => {
                            agents.push({
                                name: func.name,
                                type: 'function',
                                provider: 'Custom',
                                description: `Custom Cortex function`,
                                size: 'Custom'
                            });
                        });
                    }
                } catch (err) {
                    console.log('No custom Cortex functions found:', err.message);
                }

            } catch (connError) {
                console.log('Could not query for custom agents:', connError.message);
                // Continue with just predefined models
            }
        }

        res.json({
            success: true,
            agents: agents,
            count: agents.length
        });

    } catch (error) {
        console.error('Error listing agents:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test endpoint for Cortex Agent connectivity
app.post('/api/test-connection', async (req, res) => {
    try {
        const { account, username, password, warehouse, database, schema } = req.body;

        const connection = await getSnowflakeConnection({
            account,
            username,
            password,
            warehouse: warehouse || 'COMPUTE_WH',
            database: database || 'CORTEX_DB',
            schema: schema || 'AGENTS'
        });

        // Test query
        const result = await executeQuery(connection, 'SELECT CURRENT_VERSION() as version');

        res.json({
            success: true,
            message: 'Successfully connected to Snowflake',
            version: result[0].VERSION
        });

    } catch (error) {
        console.error('Connection test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    connectionPool.forEach(connection => {
        connection.destroy((err) => {
            if (err) {
                console.error('Error closing connection:', err);
            }
        });
    });
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`VibeCoding server running on port ${PORT}`);
    console.log(`Access the app at http://localhost:${PORT}`);
});
