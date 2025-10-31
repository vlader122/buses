// Espera a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Definir Constantes y Variables ---
    const TOTAL_SEATS = 42;
    const seatMap = document.getElementById('seat-map');
    const passengerNameInput = document.getElementById('passengerName');
    const passengerPaidCheckbox = document.getElementById('passengerPaid'); // <-- AÑADIR ESTA LÍNEA
    const assignButton = document.getElementById('assignButton');
    

    // Variable para guardar los datos de los asientos
    // Intenta cargar desde localStorage, o crea un array vacío si no hay nada
    let seatData = JSON.parse(localStorage.getItem('busSeats')) || [];

    // Variable para rastrear qué asiento está seleccionado
    let selectedSeatId = null;

    // --- 2. Funciones Principales ---

    /**
     * Inicializa el bus: crea los asientos si es la primera vez,
     * y luego los dibuja en la pantalla.
     */
    function initializeBus() {
        if (seatData.length === 0) {
            // Primera vez que se carga: crear los 42 asientos
            for (let i = 1; i <= TOTAL_SEATS; i++) {
                seatData.push({
                    id: i,
                    ocupado: false,
                    pasajero: '',
                    pagado: false, // <-- AÑADIR ESTA LÍNEA
                });
            }
        }
        renderBus();
    }

    /**
     * Dibuja el mapa de asientos en el HTML.
     */
    function renderBus() {
        seatMap.innerHTML = ''; 
        let seatCounter = 1;

        for (let i = 0; i < 11; i++) {
            const columnsInThisRow = (i < 10) ? 5 : 3; 
            
            for (let j = 1; j <= columnsInThisRow; j++) { 

                if (j === 3 && i < 10) { 
                    const aisle = document.createElement('div');
                    aisle.classList.add('aisle-spacer');
                    seatMap.appendChild(aisle);
                } else if (seatCounter <= TOTAL_SEATS) {
                    const seat = document.createElement('div');
                    const seatInfo = seatData.find(s => s.id === seatCounter);
                    
                    seat.classList.add('seat');
                    seat.dataset.id = seatCounter; 

                    // --- ¡NUEVA LÓGICA DE ESTADO Y COLOR! ---
                    if (seatInfo.ocupado) {
                        if (seatInfo.pagado) {
                            seat.classList.add('pagado'); // Pagado (Ej: Verde oscuro)
                            seat.title = `Asiento ${seatInfo.id} (Pagado): ${seatInfo.pasajero}`;
                        } else {
                            seat.classList.add('ocupado'); // Ocupado, pendiente de pago (Ej: Amarillo)
                            seat.title = `Asiento ${seatInfo.id} (Pendiente): ${seatInfo.pasajero}`;
                        }
                        seat.innerText = seatInfo.pasajero;
                    } else {
                        seat.classList.add('libre'); // Libre (Ej: Gris)
                        seat.innerText = seatCounter; 
                        seat.title = `Asiento ${seatInfo.id}: Libre`;
                    }
                    
                    if (seatCounter === selectedSeatId) {
                        seat.classList.add('selected'); // Selección (Ej: Azul)
                    }

                    seat.addEventListener('click', handleSeatClick);
                    seatMap.appendChild(seat);
                    seatCounter++;
                }
            }
        }
    }

    /**
     * Maneja el clic en un asiento.
     */
function handleSeatClick(event) {
        const clickedSeatId = parseInt(event.target.dataset.id);
        const seatInfo = seatData.find(s => s.id === clickedSeatId);

        if (seatInfo.ocupado) {
            // Si está ocupado, damos opciones
            
            let actionMessage = `Asiento ${seatInfo.id}: ${seatInfo.pasajero}`;
            
            // Construir el mensaje según el estado de pago
            if (seatInfo.pagado) {
                actionMessage += "\n(Estado: Pagado)\n\n¿Desea liberar este asiento?";
            } else {
                actionMessage += "\n(Estado: Pendiente de Pago)\n\n¿Qué desea hacer?";
            }

            // Usamos un 'prompt' simple para dar opciones
            // (En una app real, usaríamos un 'modal' o botones)
            const action = prompt(actionMessage, seatInfo.pagado ? "Liberar" : "Pagar");

            if (action === "Pagar" && !seatInfo.pagado) {
                // Opción 1: Marcar como pagado
                seatInfo.pagado = true;
            } else if (action === "Liberar") {
                // Opción 2: Liberar el asiento
                seatInfo.ocupado = false;
                seatInfo.pasajero = '';
                seatInfo.pagado = false; // Importante resetear
            } else if (action === null) {
                // El usuario presionó "Cancelar"
                return;
            }

            selectedSeatId = null; // Deseleccionar
            saveData();
            renderBus();
            
        } else {
            // Si está libre, seleccionarlo
            selectedSeatId = clickedSeatId;
            renderBus(); // Redibujar para mostrar la selección
        }
    }

    /**
     * Asigna el nombre del pasajero al asiento seleccionado.
     */
    function assignSeat() {
        const passengerName = passengerNameInput.value.trim();
        const hasPaid = passengerPaidCheckbox.checked; // <-- LEEMOS EL CHECKBOX

        if (!selectedSeatId) {
            alert('Por favor, selecciona un asiento libre primero.');
            return;
        }

        if (passengerName === '') {
            alert('Por favor, ingresa el nombre del pasajero.');
            return;
        }

        const seatInfo = seatData.find(s => s.id === selectedSeatId);
        
        seatInfo.ocupado = true;
        seatInfo.pasajero = passengerName;
        seatInfo.pagado = hasPaid; // <-- GUARDAMOS EL ESTADO DE PAGO

        // Limpiar
        passengerNameInput.value = '';
        passengerPaidCheckbox.checked = false; // Reseteamos el checkbox
        selectedSeatId = null;

        saveData();
        renderBus();
    }

    /**
     * Guarda el estado actual en localStorage.
     */
    function saveData() {
        localStorage.setItem('busSeats', JSON.stringify(seatData));
    }


    // --- 3. Iniciar la aplicación ---
    assignButton.addEventListener('click', assignSeat);
    initializeBus();

});