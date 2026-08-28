import Axios from 'axios';

const axios = Axios.create({
    baseURL: 'http://localhost',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true,
});

// Interceptor untuk menyisipkan header Tenant secara otomatis
axios.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const tenantId = localStorage.getItem('active_organization_id');
        if (tenantId) {
            config.headers['X-Organization-ID'] = tenantId;
        }
    }
    return config;
});

export default axios;