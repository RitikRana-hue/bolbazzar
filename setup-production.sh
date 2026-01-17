#!/bin/bash

# InstaSell Marketplace Production Setup Script
set -e

echo "🚀 InstaSell Marketplace Production Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check system requirements
print_status "Checking system requirements..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

print_status "System requirements check passed ✓"

# Create necessary directories
print_status "Creating directory structure..."
mkdir -p logs
mkdir -p backups
mkdir -p infra/nginx/ssl
mkdir -p data/postgres
mkdir -p data/redis

# Set permissions
chmod 755 logs backups
chmod 700 infra/nginx/ssl

print_status "Directory structure created ✓"

# Environment setup
print_status "Setting up environment configuration..."

if [ ! -f .env.production ]; then
    cp .env.example .env.production
    print_warning "Created .env.production from template. Please edit it with your production values."
else
    print_status "Production environment file already exists ✓"
fi

# Generate JWT secret if not set
if ! grep -q "JWT_SECRET=your-super-secret-jwt-key" .env.production; then
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.production
    print_status "Generated JWT secret ✓"
fi

# SSL Certificate setup
print_status "Setting up SSL certificates..."

if [ ! -f infra/nginx/ssl/cert.pem ]; then
    print_warning "SSL certificates not found. Generating self-signed certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout infra/nginx/ssl/key.pem \
        -out infra/nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=InstaSell/CN=localhost"
    print_status "Self-signed SSL certificates generated ✓"
    print_warning "For production, replace with proper SSL certificates from Let's Encrypt or your CA"
else
    print_status "SSL certificates already exist ✓"
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build the application
print_status "Building application..."
npm run build

print_status "Build completed ✓"

# Database setup
print_status "Setting up database..."

# Start database services
docker-compose up -d postgres redis

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 10

# Run migrations
print_status "Running database migrations..."
npm run migrate

print_status "Database setup completed ✓"

# Security setup
print_status "Applying security configurations..."

# Create firewall rules (if ufw is available)
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    print_status "Firewall configured ✓"
fi

# Set up log rotation
sudo tee /etc/logrotate.d/instasell > /dev/null <<EOF
/home/$(whoami)/instasell-marketplace/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 $(whoami) $(whoami)
}
EOF

print_status "Log rotation configured ✓"

# Create systemd service (optional)
read -p "Do you want to create a systemd service for auto-start? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo tee /etc/systemd/system/instasell.service > /dev/null <<EOF
[Unit]
Description=InstaSell Marketplace
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/$(whoami)/instasell-marketplace
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
User=$(whoami)

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable instasell.service
    print_status "Systemd service created and enabled ✓"
fi

# Performance tuning
print_status "Applying performance optimizations..."

# Increase file limits
echo "$(whoami) soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "$(whoami) hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Kernel parameters for better network performance
sudo tee -a /etc/sysctl.conf > /dev/null <<EOF
# InstaSell optimizations
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
EOF

sudo sysctl -p

print_status "Performance optimizations applied ✓"

# Final setup
print_status "Finalizing setup..."

# Create backup script
tee backup-script.sh > /dev/null <<EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U instasell instasell > backups/instasell_\$DATE.sql
find backups -name "instasell_*.sql" -mtime +7 -delete
echo "Backup completed: instasell_\$DATE.sql"
EOF

chmod +x backup-script.sh

# Create monitoring script
tee monitor.sh > /dev/null <<EOF
#!/bin/bash
echo "=== InstaSell System Status ==="
echo "Docker containers:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "Disk usage:"
df -h
echo ""
echo "Memory usage:"
free -h
echo ""
echo "API Health:"
curl -s http://localhost:3001/health || echo "API is down"
echo ""
echo "Web Health:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "Web is down"
EOF

chmod +x monitor.sh

print_status "Utility scripts created ✓"

# Setup complete
echo ""
echo "🎉 Production setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env.production with your production values"
echo "2. Replace SSL certificates with proper ones for production"
echo "3. Configure your domain DNS to point to this server"
echo "4. Start the production services: npm run prod:up"
echo "5. Monitor logs: npm run prod:logs"
echo ""
echo "Useful commands:"
echo "- Start services: npm run prod:up"
echo "- Stop services: npm run prod:down"
echo "- View logs: npm run prod:logs"
echo "- Check health: npm run health"
echo "- Create backup: ./backup-script.sh"
echo "- Monitor system: ./monitor.sh"
echo ""
echo "Access your application at: https://your-domain.com"
echo "Monitoring: http://your-domain.com:9090 (Prometheus)"
echo "Grafana: http://your-domain.com:3001 (admin/admin)"
echo ""
print_status "Setup completed! 🚀"