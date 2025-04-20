# Use Node.js LTS (Long Term Support) as the base image
FROM node:lts-alpine

# Create app directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package.json package-lock.json* ./

# Install dependencies using npm
RUN npm install

# Copy all application code EXCEPT config.js
# We'll mount that as a volume
COPY . .
# Remove the config.js file if it exists in the image
RUN if [ -f config.js ]; then rm config.js; fi

# Expose port 53 for DNS (both TCP and UDP)
EXPOSE 53/tcp 53/udp

# Set up healthcheck
# Checks every 30 seconds, with 5 second timeout, starts after 5 seconds, fails after 3 retries
#HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
#  CMD node -e "const dns = require('dns'); dns.lookup('localhost', (err) => process.exit(err ? 1 : 0))" || exit 1

# Use a non-root user for better security
# Create a user and group for the application
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Change ownership of the app files to the non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Command to run the application as a daemon
CMD ["npm", "start", "&"]
