import http from 'http';

const check = (port, name) => {
    return new Promise((resolve) => {
        http.get(`http://localhost:${port}`, (res) => {
            console.log(`[PASS] ${name} is responding on port ${port} (Status: ${res.statusCode})`);
            resolve(true);
        }).on('error', (e) => {
            console.log(`[FAIL] ${name} is NOT responding on port ${port} (Error: ${e.message})`);
            resolve(false);
        });
    });
};

console.log('--- Health Check ---');
await check(4000, 'Backend API');
await check(8083, 'Frontend Client');
console.log('--------------------');
