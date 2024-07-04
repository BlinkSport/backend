# Dockerfile
FROM node:20
 
# Create app directory
WORKDIR /app
 
# Install app dependencies
COPY package*.json ./
RUN npm install
 
# Copy app source code
COPY . .
 
# Expose port
EXPOSE 3333
 
# Start the app
CMD ["node", "ace", "serve", "--watch"]