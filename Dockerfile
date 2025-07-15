# Use the official Nginx image from Docker Hub
FROM nginx:latest

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration file to the container
# This file (nginx.conf) should be in the same directory as the Dockerfile
COPY nginx.conf /etc/nginx/nginx.conf

# Copy a simple HTML file to serve as the website's content
COPY index.html /usr/share/nginx/html/index.html

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
