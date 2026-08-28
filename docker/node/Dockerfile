FROM node:20-alpine

# Alpine image kadang membutuhkan libc6-compat untuk beberapa node modules
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Kita tidak melakukan 'npm install' di sini karena untuk local development, 
# kita akan men-generate node_modules melalui volume mapping agar HMR (Hot Module Replacement) berfungsi maksimal.
CMD ["npm", "run", "dev"]