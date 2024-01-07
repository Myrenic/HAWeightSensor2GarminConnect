# Use the official Node.js image as a base image
# FROM node:14
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Specify the command to run your script
CMD ["node", "src/index.js"]
