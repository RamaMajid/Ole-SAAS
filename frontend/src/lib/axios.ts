import Axios from 'axios';

const axios = Axios.create({
    baseURL: 'http://localhost',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true, // Kunci utama untuk Sanctum CSRF protection
});

export default axios;