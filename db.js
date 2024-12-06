import sql from 'mssql';

const config = {
  user: 'engin',  
  server: 'DESKTOP-CRF40QS\MSSQLSERVER01', 
  database: 'TravelPlannerDB', 
  options: {
    encrypt: false, 
    enableArithAbort: true, 
  },
};

async function connectToDatabase() {
  try {
    const pool = await sql.connect(config);
    console.log('Connected to MSSQL');
    return pool;
  } catch (err) {
    console.error('MSSQL Connection Error:', err);
    throw err;  // Hata varsa hata fırlatın
  }
}

export default connectToDatabase;
