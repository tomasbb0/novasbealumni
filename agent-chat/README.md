# Nova Alumni agent chat

Small Node service for the live networker demo. It runs outside the static Next site and sends Server Sent Events to `/networker`.

## Local run

1. Copy `.env.example` to `.env`.
2. Add `ANTHROPIC_API_KEY`.
3. Run `npm install` inside `agent-chat`.
4. Run `npm start`.
5. Open `http://localhost:8787/health`.

## Endpoints

`GET /health` returns `{ "ok": true }`.

`POST /chat` accepts JSON with `query`, optional `sessionId`, and optional `emailMe`.

`POST /chat/:sessionId/interrupt` stops the current model call for that session.

## Hetzner deploy with systemd

Create `/opt/agent-chat` on the server and copy this folder plus the repo `data` folder beside it, or deploy the whole repo and set the working directory to `agent-chat`.

Example service file at `/etc/systemd/system/agent-chat.service`:

```ini
[Unit]
Description=Nova Alumni agent chat
After=network.target

[Service]
WorkingDirectory=/opt/NovaAlumniConnect/agent-chat
EnvironmentFile=/opt/NovaAlumniConnect/agent-chat/.env
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
User=www-data

[Install]
WantedBy=multi-user.target
```

Then run these on the server:

```sh
cd /opt/NovaAlumniConnect/agent-chat
npm install
systemctl daemon-reload
systemctl enable agent-chat
systemctl start agent-chat
systemctl status agent-chat
```

Point Caddy or another TLS proxy at port `8787`. Set the frontend build variable `NEXT_PUBLIC_AGENT_CHAT_URL` to the public `/chat` URL.

Email mode is accepted by the API today. Sending the actual email still needs a mail provider such as Resend and a verified sender domain.
