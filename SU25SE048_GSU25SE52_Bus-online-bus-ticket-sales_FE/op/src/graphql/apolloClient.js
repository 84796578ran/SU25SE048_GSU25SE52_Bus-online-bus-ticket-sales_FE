import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
const httpLink = createHttpLink({
    uri: 'https://68366847664e72d28e40a9cf.mockapi.io/api/'
});
// Nếu cần thêm headers (như token xác thực)
const authLink = setContext((_, { headers }) => {
    // Lấy token từ localStorage nếu có
    const token = localStorage.getItem('authToken');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    }
});
// Tạo Apollo Client
const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
});
export default client;