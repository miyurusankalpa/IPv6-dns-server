FROM linuxserver/webtop:debian-xfce

# Set environment to non-interactive
ENV DEBIAN_FRONTEND=noninteractive

# 1. Install core requirements
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    chromium \
    git \
    nodejs \
    iproute2 \
    && rm -rf /var/lib/apt/lists/*

# 2. Clone and build your IPv6 DNS Server repository
RUN git clone https://gitlab.com/miyurusankalpa/IPv6-dns-server.git /opt/ipv6-dns && \
    cd /opt/ipv6-dns && \
    npm install && \
    if [ -f config.json.sample ]; then cp config.json.sample config.json; fi

# 3. Inject Master Chromium Policies (Forces installation + Forces Pinning to Toolbar)
RUN mkdir -p /etc/chromium/policies/managed \
             /etc/chromium-browser/policies/managed \
             /usr/share/chromium/policies/managed && \
    cat << 'EOF' > /etc/chromium/policies/managed/policies.json
{
  "ExtensionSettings": {
    "ecanpcehffngcegjmadlcijfolapggal": {
      "installation_mode": "force_installed",
      "update_url": "https://clients2.google.com/service/update2/crx",
      "toolbar_pin": "force_pinned"
    }
  },
  "DefaultSearchProviderEnabled": true,
  "DefaultSearchProviderName": "IPv6 Google",
  "DefaultSearchProviderKeyword": "ipv6",
  "DefaultSearchProviderSearchURL": "https://ipv6.google.com/search?q={searchTerms}",
  "RestoreOnStartup": 4,
  "RestoreOnStartupURLs": [
    "https://ip6.biz"
  ]
}
EOF
# Clone the policy file across all potential Debian Chromium lookup paths to guarantee execution
RUN cp /etc/chromium/policies/managed/policies.json /etc/chromium-browser/policies/managed/policies.json && \
    cp /etc/chromium/policies/managed/policies.json /usr/share/chromium/policies/managed/policies.json && \
    chmod -R 644 /etc/chromium*/policies/managed/* /usr/share/chromium/policies/managed/*

# 4. Setup S6 supervisor service to run your Node DNS server as a flat script file
RUN mkdir -p /custom-services.d && \
    cat << 'EOF' > /custom-services.d/ipv6-dns
#!/bin/bash
exec 2>&1

LOG_FILE="/config/dns-app.log"
echo "=== DNS Server Initialization: $(date) ===" > "$LOG_FILE"

# Overwrite the bind-mounted resolv.conf file directly at execution runtime
echo "nameserver ::1" > /etc/resolv.conf
echo "[INIT] /etc/resolv.conf forced to nameserver ::1" >> "$LOG_FILE"
echo "[INIT] Verification of current lines:" >> "$LOG_FILE"
cat /etc/resolv.conf >> "$LOG_FILE"

cd /opt/ipv6-dns
if [ -f "app.js" ]; then
    echo "[INIT] Launching Node application context..." >> "$LOG_FILE"
    exec node app.js >> "$LOG_FILE" 2>&1
else
    echo "[CRITICAL ERROR] app.js was not found in execution directory!" >> "$LOG_FILE"
    exit 1
fi
EOF
RUN chmod +x /custom-services.d/ipv6-dns

# 5. Inject Desktop Shortcut Initialization & Session Autostart
RUN mkdir -p /custom-cont-init.d && \
    cat << 'EOF' > /custom-cont-init.d/99-user-setup
#!/bin/bash

echo "**** Provisioning XFCE Desktop Folders ****"
mkdir -p /config/Desktop
mkdir -p /config/.config/autostart

# Create the Chromium Desktop Shortcut
cat << 'APP' > /config/Desktop/chromium.desktop
[Desktop Entry]
Version=1.0
Type=Application
Name=Chromium
Exec=/usr/bin/chromium --no-sandbox https://ip6.biz %U
Icon=chromium
Terminal=false
APP
chmod +x /config/Desktop/chromium.desktop
chown abc:abc /config/Desktop/chromium.desktop

# Add Chromium shortcut to XFCE session startup
cp /config/Desktop/chromium.desktop /config/.config/autostart/
chown abc:abc /config/.config/autostart/chromium.desktop

EOF
RUN chmod +x /custom-cont-init.d/99-user-setup
