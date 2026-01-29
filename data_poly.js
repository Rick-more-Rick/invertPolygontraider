const API_KEY = 'Q3I6b14c8HL2l_A7faplgnuMTXekxCUU';
let socket;
let lastPrice = 0;

function iniciarConexion() {
    socket = new WebSocket('wss://socket.polygon.io/stocks');

    socket.onopen = () => {
        document.getElementById('status-badge').innerText = "CONECTADO";
        document.getElementById('status-badge').className = "px-3 py-1 rounded-full bg-green-900 text-green-300 text-xs";
        socket.send(JSON.stringify({ action: 'auth', params: API_KEY }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const now = Date.now();

        data.forEach((msg) => {
            // Autenticación exitosa
            if (msg.ev === 'status' && msg.status === 'auth_success') {
                socket.send(JSON.stringify({ action: 'subscribe', params: 'AM.AAPL,T.AAPL' }));
            }

            // Datos de TRADE (V/C) - Actualización instantánea
            if (msg.ev === 'T') {
                const priceEl = document.getElementById('aapl-price');
                const cardEl = document.getElementById('ticker-aapl');
                const latencyEl = document.getElementById('aapl-latency');

                // Efecto visual de cambio de precio
                if (msg.p > lastPrice) {
                    cardEl.classList.add('update-up');
                    setTimeout(() => cardEl.classList.remove('update-up'), 500);
                } else if (msg.p < lastPrice) {
                    cardEl.classList.add('update-down');
                    setTimeout(() => cardEl.classList.remove('update-down'), 500);
                }

                priceEl.innerText = `$${msg.p.toFixed(2)}`;
                latencyEl.innerText = `${now - msg.t}ms`;
                lastPrice = msg.p;
            }

            // Datos de VELA (G)
            if (msg.ev === 'AM') {
                document.getElementById('aapl-vela').innerText = `O: ${msg.o} H: ${msg.h} L: ${msg.l} C: ${msg.c}`;
            }
        });
    };

    socket.onclose = () => {
        document.getElementById('status-badge').innerText = "RECONECTANDO...";
        document.getElementById('status-badge').className = "px-3 py-1 rounded-full bg-red-900 text-red-300 text-xs";
        setTimeout(iniciarConexion, 1000);
    };
}

iniciarConexion();