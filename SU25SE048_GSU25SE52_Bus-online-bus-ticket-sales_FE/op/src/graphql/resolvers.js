// resolvers.js
const resolvers = {
    Query: {
        searchTrips: async (_, args, { db }) => {
            try {
                // Thực hiện truy vấn database
                const trips = await db.Trip.findAll({
                    where: {
                        FromLocation: args.FromLocation,
                        EndLocation: args.EndLocation,
                        // Các điều kiện khác...
                    }
                });
                return trips;
            } catch (error) {
                throw new Error('Không thể lấy dữ liệu chuyến đi');
            }
        }
    }
};
module.exports = resolvers;