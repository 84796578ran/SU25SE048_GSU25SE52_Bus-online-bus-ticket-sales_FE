const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('BuyOnlineBusTicketSales', 'sa', 'Thanhtrung12345', {
    dialect: 'SQL Server'
});
const Trip = sequelize.define('Trip', {
    TripID: {
        type: Sequelize.STRING, allowNull: false
    },
    timeStart: { type: Sequelize.STRING, allowNull: false },
    timeEnd: { type: Sequelize.STRING, allowNull: false },
    FromLocation: { type: Sequelize.STRING, allowNull: false },
    EndLocation: { type: Sequelize.STRING, allowNull: false },
    price: { type: Sequelize.FLOAT, allowNull: true },
});
module.exports = { sequelize, Trip };