const express = require('express');
const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sunucu başarıyla ayağa kalktı! http://localhost:${PORT} adresinde dinleniyor...`);
});