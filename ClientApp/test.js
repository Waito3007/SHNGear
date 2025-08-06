const sql = require('mssql');

const config = {
    user: 'db23328',
    password: '30072004',
    server: 'db23328.public.databaseasp.net',
    database: 'db23328',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

async function testConnection() {
    try {
        let pool = await sql.connect(config);
        console.log('✅ Kết nối thành công!');
        await pool.close();
    } catch (err) {
        console.error('❌ Kết nối thất bại:', err.message);
    }
}

testConnection();